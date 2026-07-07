from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.battle_library import BattleLibrary

router = APIRouter(prefix="/api/battle-library", tags=["BattleLibrary"])


class SaveBattleRequest(BaseModel):
    excuse_text: str
    success: bool
    suspicion: int
    turns: int
    defense_type: str | None = None
    defense_type_reason: str | None = None


@router.post("/save", summary="배틀 결과 디펜스 도감에 저장")
def save_battle(
    body: SaveBattleRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    item = BattleLibrary(
        member_id=current_user["id"],
        excuse_text=body.excuse_text,
        success=body.success,
        suspicion=body.suspicion,
        turns=body.turns,
        defense_type=body.defense_type,
        defense_type_reason=body.defense_type_reason,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "message": "저장 완료"}


@router.get("", summary="디펜스 도감 목록 조회")
def get_battle_library(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    items = (
        db.query(BattleLibrary)
        .filter(BattleLibrary.member_id == current_user["id"])
        .order_by(BattleLibrary.saved_at.desc())
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "excuse_text": item.excuse_text,
                "success": item.success,
                "suspicion": item.suspicion,
                "turns": item.turns,
                "defense_type": item.defense_type,
                "defense_type_reason": item.defense_type_reason,
                "saved_at": item.saved_at.strftime("%m/%d") if item.saved_at else None,
            }
            for item in items
        ]
    }
