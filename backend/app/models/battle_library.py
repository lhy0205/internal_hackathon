from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class BattleLibrary(Base):
    __tablename__ = "battle_library"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    member_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    excuse_text: Mapped[str] = mapped_column(String(500), nullable=False)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False)
    suspicion: Mapped[int] = mapped_column(Integer, nullable=False)
    turns: Mapped[int] = mapped_column(Integer, nullable=False)
    defense_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    defense_type_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
