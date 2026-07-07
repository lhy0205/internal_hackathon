from pydantic import BaseModel
from typing import Literal

RankType = Literal["F", "C", "B", "A", "S", "?"]
ColorType = Literal["gold", "purple", "cyan", "red", "lime", "pink", "locked"]


# ── GET /api/library ───────────────────────────────────
class LibraryItem(BaseModel):
    id: int
    category: str | None
    rank: RankType
    rank_color: ColorType
    stars: int
    text: str | None


class LibraryResponse(BaseModel):
    items: list[LibraryItem]


# ── GET /api/library/stats ─────────────────────────────
class LibraryStatsResponse(BaseModel):
    collected: int
    total: int
