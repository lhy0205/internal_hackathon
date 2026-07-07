import httpx
import json

# ngrok URL 또는 로컬 서버
BASE_URL = "https://knee-tribunal-angular.ngrok-free.dev"
#BASE_URL = "http://localhost:8001"  # 로컬 테스트

print(f"🚀 AI 서버 연결 중: {BASE_URL}\n")
client = httpx.Client(base_url=BASE_URL, timeout=30.0)

print("=" * 60)
print("변명 생성 및 배틀 시뮬레이션")
print("=" * 60)

# ===== 오늘의 변명 표시 (제일 위로 이동 - 처음) =====
# 오늘의 변명 보기 (선택사항)
print("\n" + "=" * 60)
print("【 보너스: 오늘의 변명 】")
print("-" * 60)

response = client.get("/api/excuses/daily")
print(f"[DEBUG] Status: {response.status_code}")
print(f"[DEBUG] Content: {response.text}")
try:
    daily = response.json()
    print(f"\n💡 오늘의 변명: {daily['text']}")
    print(f"📅 날짜: {daily['date']}")
except Exception as e:
    print(f"[ERROR] 오늘의 변명 로드 실패: {e}")
    daily = None
# ===== 오늘의 변명 표시 (끝) =====

# 1단계: 상황 선택
print("\n" + "=" * 60)
print("【 1단계: 상황 선택 】")
print("-" * 60)

situations = {
    "1": ("homework", "숙제·팀플"),
    "2": ("promise", "약속"),
    "3": ("social", "회식·모임"),
    "4": ("work", "알바"),
    "5": ("family", "가족 행사")
}

print("\n상황을 선택하세요:")
for key, (quest_id, label) in situations.items():
    print(f"{key}. {label}")

choice = input("\n선택 (1-5): ").strip() or "2"
quest_id, base_situation = situations.get(choice, situations["2"])

detail = input(f"\n{base_situation}에 대해 자세하게 입력하세요 (예: 친구와의 저녁 약속): ").strip()
situation = f"{base_situation} - {detail}" if detail else base_situation

tone = int(input("\n🎤 정중함을 선택하세요 (1=막말, 5=보통, 10=존댓말): ").strip() or "5")
risk = int(input("🎯 신뢰도를 선택하세요 (1=거짓, 5=보통, 10=진짜): ").strip() or "5")

# 2단계: 변명 생성
print("\n" + "=" * 60)
print("【 2단계: 변명 생성 】")
print("-" * 60)

print("\n🤖 변명 생성 중...\n")
response = client.post("/api/excuses/summon", json={
    "quest_id": quest_id,
    "tone": tone,
    "risk": risk,
    "situation": situation,
})
print(f"Status: {response.status_code}")
result = response.json()

print("\n생성된 변명 (카드):")
for i, card in enumerate(result["cards"], 1):
    print(f"\n{i}. [{card['rank']} · {card['stars']}⭐] {card['text']}")
    print(f"   {card['reaction']}")
    print(f"   주의: {card['tip']}")
    print(f"   ID: {card['id']}")

# 3단계: 변명 선택
print("\n" + "=" * 60)
print("【 3단계: 변명 선택 】")
print("-" * 60)

choice = int(input("\n선택할 변명 번호를 입력하세요 (1-3): ").strip() or "1")
selected_card = result["cards"][choice - 1]
selected_excuse = selected_card["text"]

print(f"\n✅ 선택한 변명: {selected_excuse}")
print(f"   등급: {selected_card['rank']} ({selected_card['stars']}⭐)")

# 4단계: 배틀 시작
print("\n" + "=" * 60)
print("【 4단계: 배틀 시작 】")
print("-" * 60)

print("\n🤖 배틀 시작 중...\n")
response = client.post("/api/battle/start", json={
    "quest_id": quest_id,
    "excuse_text": selected_excuse,
})
battle_result = response.json()
battle_id = battle_result["battle_id"]

print(f"📍 변명: {selected_excuse}")
print(f"🚨 상대 반응: {battle_result['enemy_line']}")
print(f"📊 초기 의심도: {battle_result['suspicion']}%\n")

# 5단계: 디펜스 시뮬레이션 (3턴)
print("=" * 60)
print("【 5단계: 디펜스 시뮬레이션 】")
print("=" * 60)

turn_result = None
for attempt in range(1, 4):
    print(f"\n{'=' * 60}")
    print(f"턴 {attempt}/3")
    print(f"{'=' * 60}")

    user_defense = input("\n💬 당신의 디펜스를 입력하세요: ").strip()

    if not user_defense:
        print("⚠️ 입력이 비었습니다.")
        attempt -= 1
        continue

    print("\n🤖 상대 반응 생성 중...\n")
    response = client.post(f"/api/battle/{battle_id}/turn", json={
        "user_input": user_defense,
    })
    turn_result = response.json()

    print(f"🚨 상대 반응: {turn_result['enemy_reaction']}")
    print(f"📊 의심도: {turn_result['suspicion']}%")

    if turn_result["is_final"]:
        print(f"\n【 배틀 종료 】")
        if turn_result["success"]:
            print("✅ 성공! 상대의 의심을 충분히 낮췄습니다!")
        else:
            print("❌ 실패! 상대가 여전히 의심하고 있습니다.")
        break

# 6단계: 결과 요약
print("\n" + "=" * 60)
print("【 최종 결과 】")
print("=" * 60)

print(f"\n📍 선택한 변명: {selected_excuse}")
print(f"🎤 정중함: {tone}/10")
print(f"🎯 신뢰도: {risk}/10")

if turn_result:
    print(f"📊 최종 의심도: {turn_result['suspicion']}%")

    if turn_result["success"] is None:
        print("⏸️ 배틀이 아직 진행 중입니다.")
    elif turn_result["success"]:
        print("✅ 결과: 성공")

        # ===== 유형 분석 표시 (처음) =====
        defense_type = turn_result.get("defense_type")
        if defense_type and isinstance(defense_type, dict):
            print(f"\n🎭 디펜스 유형: {defense_type.get('defense_type', 'N/A')}")
            print(f"   이유: {defense_type.get('reason', 'N/A')}")
        else:
            print("\n⚠️ 유형 분석 데이터 없음")
        # ===== 유형 분석 표시 (끝) =====
    else:
        print("❌ 결과: 실패")
