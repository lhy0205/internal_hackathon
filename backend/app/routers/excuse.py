from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from app.ai.gpt_client import GPTClient
from app.config import settings
from app.schemas.excuse import (
    DailyResponse,
    ExcuseCard,
    PreviewResponse,
    SummonRequest,
    SummonResponse,
)

router = APIRouter(prefix="/api/excuses", tags=["Excuses"])

_ai = GPTClient(api_key=settings.gpt_api_key)

_QUEST_PREFIX = {
    "homework": "HW",
    "promise": "PROMISE",
    "social": "SOCIAL",
    "work": "WORK",
    "family": "FAMILY",
}
_QUEST_CATEGORY = {
    "homework": "과제·팀플",
    "promise": "약속",
    "social": "회식·모임",
    "work": "야근",
    "family": "가족 행사",
}
_GRADE_STARS = {"S": 5, "A": 4, "B": 3, "C": 2, "F": 1}


# ── POST /api/excuses/summon ───────────────────────────────────────────────────
@router.post(
    "/summon",
    response_model=SummonResponse,
    summary="변명 카드 3장 소환",
)
def summon_excuses(body: SummonRequest):
    result = _ai.generate_excuses(
        tone=body.tone,
        risk=body.risk,
        situation=body.situation,
    )
    today = datetime.now().strftime("%Y%m%d")
    prefix = _QUEST_PREFIX.get(body.quest_id, "EX")
    category = _QUEST_CATEGORY.get(body.quest_id)

    cards = [
        ExcuseCard(
            id=f"{prefix}-{today}-{i + 1:02d}",
            rank=excuse["grade"],
            stars=_GRADE_STARS.get(excuse["grade"], 1),
            text=excuse["text"],
            reaction=excuse["reaction"],
            tip=excuse["caution"],
            category=category,
        )
        for i, excuse in enumerate(result["excuses"])
    ]
    return SummonResponse(cards=cards)


# ── GET /api/excuses/preview ───────────────────────────────────────────────────
@router.get(
    "/preview",
    response_model=PreviewResponse,
    summary="스킬 프리뷰 - tone/risk 기반 등급 미리보기",
)
def preview_excuse(tone: int, risk: int):
    if not (1 <= tone <= 10) or not (1 <= risk <= 10):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="tone과 risk는 1~10 사이 값이어야 합니다.",
        )
    result = _ai.generate_preview(tone, risk)
    return PreviewResponse(
        text=result["text"],
        grade=result["grade"],
        grade_color=result["grade_color"],
    )


# ── GET /api/excuses/daily ─────────────────────────────────────────────────────
@router.get(
    "/daily",
    response_model=DailyResponse,
    summary="오늘의 핑계 문장",
)
def daily_excuse():
    result = _ai.generate_daily()
    return DailyResponse(text=result["text"], date=result["date"])
