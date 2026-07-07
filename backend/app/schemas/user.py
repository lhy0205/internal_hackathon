from pydantic import BaseModel
from typing import Literal

ColorType = Literal["gold", "purple", "cyan", "red", "lime", "pink"]
RankType = Literal["F", "C", "B", "A", "S"]
RankColorType = Literal["gold", "purple", "cyan", "red", "lime"]


# ── GET /api/user/profile ──────────────────────────────
class UserProfileResponse(BaseModel):
    name: str
    level: int
    title: str
    xp: int
    xp_max: int     # 프론트에서 xpMax로 매핑
    coins: int
    mp: int


# ── GET /api/user/stats ────────────────────────────────
class UserStatItem(BaseModel):
    value: str
    label: str
    color: ColorType


# ── GET /api/user/achievements ─────────────────────────
class AchievementItem(BaseModel):
    icon: str
    name: str
    desc: str
    done: bool


# ── GET /api/user/history ──────────────────────────────
class HistoryItem(BaseModel):
    rank: RankType
    rank_color: RankColorType
    text: str
    date: str
