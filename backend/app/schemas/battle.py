from pydantic import BaseModel
from typing import Optional
from uuid import UUID


# ── POST /api/battle/start ─────────────────────────────
class BattleStartRequest(BaseModel):
    quest_id: str   # "promise" / "homework" / "social" / "work" / "family"
    excuse_text: str


class BattleStartResponse(BaseModel):
    battle_id: str
    suspicion: int      # 0~100
    enemy_line: str


# ── POST /api/battle/{battle_id}/turn ─────────────────
class BattleTurnRequest(BaseModel):
    user_input: str


class DefenseType(BaseModel):
    defense_type: str
    reason: str


class BattleTurnResponse(BaseModel):
    suspicion: int
    enemy_reaction: str
    enemy_line: Optional[str]
    is_final: bool
    success: Optional[bool]
    defense_type: Optional[DefenseType]
