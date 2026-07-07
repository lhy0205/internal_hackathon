from uuid import uuid4
from fastapi import APIRouter, HTTPException, status

from app.ai.gpt_client import GPTClient
from app.ai.storage import battle_storage
from app.config import settings
from app.schemas.battle import (
    BattleStartRequest,
    BattleStartResponse,
    BattleTurnRequest,
    BattleTurnResponse,
    DefenseType,
)
from app.services import battle_service

router = APIRouter(prefix="/api/battle", tags=["Battle"])

_ai = GPTClient(api_key=settings.gpt_api_key)

MAX_TURNS = 3


# ── POST /api/battle/start ─────────────────────────────────────────────────────
@router.post(
    "/start",
    response_model=BattleStartResponse,
    summary="배틀 시작 - 변명 디펜스 게임 초기화",
)
def start_battle(body: BattleStartRequest):
    battle_id = str(uuid4())

    suspicion_result = _ai.measure_suspicion(
        original_excuse=body.excuse_text,
        conversation_history=[],
    )
    suspicion: int = suspicion_result["suspicion"]

    enemy_line: str = _ai.generate_enemy_line(
        excuse_text=body.excuse_text,
        attempt_num=1,
    )

    battle_storage.create_battle(battle_id, body.excuse_text)
    battle_service.create_session(body.quest_id, body.excuse_text, battle_id, suspicion)

    return BattleStartResponse(
        battle_id=battle_id,
        suspicion=suspicion,
        enemy_line=enemy_line,
    )


# ── POST /api/battle/{battle_id}/turn ──────────────────────────────────────────
@router.post(
    "/{battle_id}/turn",
    response_model=BattleTurnResponse,
    summary="턴 제출 (최대 3턴)",
)
def submit_turn(battle_id: str, body: BattleTurnRequest):
    session = battle_service.get_session(battle_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않거나 만료된 배틀 세션입니다.",
        )
    if session.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 종료된 배틀입니다.",
        )

    battle = battle_storage.get_battle(battle_id)
    if not battle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="배틀 스토리지에서 세션을 찾을 수 없습니다.",
        )

    original_excuse: str = battle["excuse_text"]
    history: list = battle["conversation_history"]
    attempt_num: int = battle["attempt_num"] + 1

    # 이전 상대 반응 (없으면 빈 문자열)
    prev_opponent_reaction: str = history[-1]["opponent"] if history else ""

    # GPT: 상대 반응 생성
    enemy_reaction: str = _ai.generate_defense_reaction(
        original_excuse=original_excuse,
        opponent_reaction=prev_opponent_reaction,
        user_defense=body.user_input,
        attempt_num=attempt_num,
    )

    # 이번 턴까지 포함한 임시 히스토리
    updated_history = history + [{"user": body.user_input, "opponent": enemy_reaction}]

    # GPT: 새 의심도 측정
    suspicion_result = _ai.measure_suspicion(
        original_excuse=original_excuse,
        conversation_history=updated_history,
    )
    new_suspicion: int = suspicion_result["suspicion"]

    # 스토리지 / 세션 업데이트
    battle_storage.update_battle_turn(battle_id, body.user_input, enemy_reaction, new_suspicion)
    session.turn += 1
    session.suspicion = new_suspicion

    is_final: bool = (session.turn >= MAX_TURNS) or (new_suspicion <= 0)
    success = (new_suspicion <= 60) if is_final else None

    # 다음 턴 적 대사 (마지막 턴이면 없음)
    enemy_line: str | None = None
    if not is_final:
        enemy_line = _ai.generate_enemy_line(
            excuse_text=original_excuse,
            attempt_num=attempt_num + 1,
        )

    # 성공 시 디펜스 유형 분석
    defense_type: DefenseType | None = None
    if success:
        try:
            raw = _ai.analyze_defense_type(conversation_history=updated_history)
            defense_type = DefenseType(
                defense_type=raw.get("defense_type", ""),
                reason=raw.get("reason", ""),
            )
        except Exception as e:
            print(f"[ERROR] analyze_defense_type 실패: {e}")

    if is_final:
        battle_service.finish_session(battle_id)

    return BattleTurnResponse(
        suspicion=new_suspicion,
        enemy_reaction=enemy_reaction,
        enemy_line=enemy_line,
        is_final=is_final,
        success=success,
        defense_type=defense_type,
    )
