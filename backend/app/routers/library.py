from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.excuse_library import ExcuseLibrary

router = APIRouter(prefix="/api/library", tags=["Library"])

RANK_COLORS = {"S": "gold", "A": "purple", "B": "cyan", "C": "lime", "F": "red"}


class SaveExcuseRequest(BaseModel):
    rank: str
    stars: int
    text: str
    reaction: str | None = None
    tip: str | None = None
    category: str | None = None


# ── POST /api/library/save ──────────────────────────────────────────────────────
@router.post("/save", summary="변명 카드 도감에 저장")
def save_excuse(
    body: SaveExcuseRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    item = ExcuseLibrary(
        member_id=current_user["id"],
        rank=body.rank,
        rank_color=RANK_COLORS.get(body.rank, "cyan"),
        stars=body.stars,
        text=body.text,
        reaction=body.reaction,
        tip=body.tip,
        category=body.category,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "message": "저장 완료"}


# ── GET /api/library ────────────────────────────────────────────────────────────
@router.get("", summary="변명 도감 목록 조회")
def get_library(
    category: str = "전체",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.query(ExcuseLibrary).filter(ExcuseLibrary.member_id == current_user["id"])
    if category != "전체":
        query = query.filter(ExcuseLibrary.category == category)
    items = query.order_by(ExcuseLibrary.saved_at.desc()).all()

    return {
        "items": [
            {
                "id": item.id,
                "rank": item.rank,
                "rank_color": item.rank_color,
                "stars": item.stars,
                "text": item.text,
                "reaction": item.reaction,
                "tip": item.tip,
                "category": item.category,
                "saved_at": item.saved_at.strftime("%m/%d") if item.saved_at else None,
            }
            for item in items
        ]
    }


# ── GET /api/library/stats ──────────────────────────────────────────────────────
@router.get("/stats", summary="변명 도감 수집 통계")
def get_library_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    collected = db.query(ExcuseLibrary).filter(ExcuseLibrary.member_id == current_user["id"]).count()
    return {"collected": collected, "total": 60}


# ── GET /api/library/{id} ───────────────────────────────────────────────────────
@router.get("/{item_id}", summary="변명 카드 상세 조회")
def get_library_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    item = db.query(ExcuseLibrary).filter(
        ExcuseLibrary.id == item_id,
        ExcuseLibrary.member_id == current_user["id"],
    ).first()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="카드를 찾을 수 없습니다.")
    return {
        "id": item.id,
        "rank": item.rank,
        "rank_color": item.rank_color,
        "stars": item.stars,
        "text": item.text,
        "reaction": item.reaction,
        "tip": item.tip,
        "category": item.category,
        "saved_at": item.saved_at.strftime("%m/%d") if item.saved_at else None,
    }
