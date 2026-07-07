from datetime import datetime
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class ExcuseLibrary(Base):
    __tablename__ = "excuse_library"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    member_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    rank: Mapped[str] = mapped_column(String(2), nullable=False)
    rank_color: Mapped[str] = mapped_column(String(20), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(String(500), nullable=False)
    reaction: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tip: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
