import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai.gpt_client import GPTClient
from ai.storage import storage

load_dotenv()

# ngrok 설정
try:
    from pyngrok import ngrok
    ngrok_token = os.getenv("NGROK_AUTH_TOKEN")
    if ngrok_token:
        ngrok.set_auth_token(ngrok_token)
        print("[OK] ngrok auth token set")
except ImportError:
    print("[WARN] pyngrok not installed. Run: pip install pyngrok")

app = FastAPI(title="AI Server - 변명 생성 (GPT)")

# CORS 설정 - 모든 오리진 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드
print("[INFO] AI Server initializing...")
ai_client = GPTClient()


# ===== Pydantic Models =====
class GenerateExcuseSummonRequest(BaseModel):
    quest_id: str
    tone: int
    risk: int
    situation: str


@app.post("/api/excuses/summon")
async def generate_excuses_summon(request: GenerateExcuseSummonRequest):
    """
    변명 3개 생성 (카드 형식)
    """
    from datetime import datetime

    result = ai_client.generate_excuses(
        tone=request.tone,
        risk=request.risk,
        situation=request.situation,
    )

    # quest_id별 prefix 매핑
    quest_prefix = {
        "homework": "HW",
        "promise": "PROMISE",
        "social": "SOCIAL",
        "work": "WORK",
        "family": "FAMILY"
    }

    # 날짜 생성
    today = datetime.now().strftime("%Y%m%d")

    # 각 excuse를 card로 변환 및 id 생성
    cards = []
    for i, excuse in enumerate(result["excuses"]):
        card = {
            "id": f"{quest_prefix.get(request.quest_id, 'EX')}-{today}-{i+1:02d}",
            "rank": excuse["grade"],
            "stars": {"S": 5, "A": 4, "B": 3, "C": 2, "F": 1}.get(excuse["grade"], 1),
            "text": excuse["text"],
            "reaction": excuse["reaction"],
            "tip": excuse["caution"]
        }
        cards.append(card)

    return {"cards": cards}


@app.get("/api/excuses/preview")
async def generate_excuses_preview(tone: int, risk: int):
    """
    미리보기용 한 줄 변명 생성
    """
    result = ai_client.generate_preview(tone, risk)
    return result


@app.get("/api/excuses/daily")
async def generate_excuses_daily():
    """
    일일 변명 생성
    """
    result = ai_client.generate_daily()
    return result


class BattleStartRequest(BaseModel):
    quest_id: str
    excuse_text: str


@app.post("/api/battle/start")
async def battle_start(request: BattleStartRequest):
    """
    배틀 시작
    """
    import uuid

    # battle_id 생성
    battle_id = str(uuid.uuid4())

    # 초기 의심도 측정
    suspicion_result = ai_client.measure_suspicion(
        original_excuse=request.excuse_text,
        conversation_history=[]
    )

    # 첫 번째 적 대사 생성
    enemy_line = ai_client.generate_enemy_line(
        excuse_text=request.excuse_text,
        attempt_num=1
    )

    # 배틀 생성
    storage.create_battle(battle_id, request.excuse_text)

    return {
        "battle_id": battle_id,
        "suspicion": suspicion_result["suspicion"],
        "enemy_line": enemy_line
    }


class BattleTurnRequest(BaseModel):
    user_input: str


@app.post("/api/battle/{battle_id}/turn")
async def battle_turn(battle_id: str, request: BattleTurnRequest):
    """
    배틀 턴 진행
    """
    # 배틀 조회
    battle = storage.get_battle(battle_id)
    if not battle:
        return {"error": "Battle not found"}

    # 파라미터 준비
    original_excuse = battle["excuse_text"]
    opponent_reaction = battle["conversation_history"][-1]["opponent"] if battle["conversation_history"] else ""
    user_defense = request.user_input
    attempt_num = battle["attempt_num"] + 1

    # 상대 반응 생성
    enemy_reaction = ai_client.generate_defense_reaction(
        original_excuse=original_excuse,
        opponent_reaction=opponent_reaction,
        user_defense=user_defense,
        attempt_num=attempt_num
    )

    # 임시 대화 히스토리
    temp_history = battle["conversation_history"] + [{
        "user": user_defense,
        "opponent": enemy_reaction
    }]

    # 새로운 의심도 측정
    suspicion_result = ai_client.measure_suspicion(
        original_excuse=original_excuse,
        conversation_history=temp_history
    )
    new_suspicion = suspicion_result["suspicion"]

    # 배틀 턴 업데이트
    storage.update_battle_turn(battle_id, user_defense, enemy_reaction, new_suspicion)

    # is_final 판단
    is_final = (battle["attempt_num"] >= 3) or (new_suspicion <= 0)

    # success 판단
    success = (new_suspicion <= 60) if is_final else None

    # enemy_line 생성
    enemy_line = None
    if not is_final:
        enemy_line = ai_client.generate_enemy_line(
            excuse_text=original_excuse,
            attempt_num=battle["attempt_num"] + 1
        )

    # ===== 유형 분석 추가 (처음) =====
    # 성공했을 때만 디펜스 유형 분석
    defense_type = None
    if success:
        try:
            defense_type_result = ai_client.analyze_defense_type(
                conversation_history=temp_history
            )
            defense_type = defense_type_result
        except Exception as e:
            print(f"[ERROR] analyze_defense_type 실패: {str(e)}")
            defense_type = None
    # ===== 유형 분석 추가 (끝) =====

    return {
        "suspicion": new_suspicion,
        "enemy_reaction": enemy_reaction,
        "enemy_line": enemy_line,
        "is_final": is_final,
        "success": success,
        "defense_type": defense_type
    }


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "ok", "server": "AI Server - 변명 생성 (GPT)"}
