from pydantic import BaseModel
from typing import Literal

RankType = Literal["F", "C", "B", "A", "S"]
ColorType = Literal["gold", "purple", "cyan", "red", "lime", "pink", "locked"]


# ── POST /api/excuses/summon ───────────────────────────
class SummonRequest(BaseModel):
    quest_id: str
    tone: int   # 1~10: 낮을수록 무난, 높을수록 극적
    risk: int   # 1~10: 낮을수록 안전, 높을수록 위험
    situation: str


class ExcuseCard(BaseModel):
    id: str
    rank: RankType
    stars: int
    text: str
    reaction: str
    tip: str
    category: str | None = None


class SummonResponse(BaseModel):
    cards: list[ExcuseCard]


# ── GET /api/excuses/preview ───────────────────────────
class PreviewResponse(BaseModel):
    text: str
    grade: str        # e.g. "A · EPIC"
    grade_color: ColorType


# ── GET /api/excuses/daily ─────────────────────────────
class DailyResponse(BaseModel):
    text: str
    date: str         # e.g. "06/22"
