from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Member(Base):
    """
    Google OAuth 전용 회원 테이블.
    provider는 현재 "google" 고정이나 추후 kakao 등으로 확장 가능.
    """

    __tablename__ = "member"

    # SQLite 호환을 위해 Integer 사용 (MySQL 배포 시 BigInteger로 변경)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)  # Google sub

    def __repr__(self) -> str:
        return f"<Member id={self.id} email={self.email} provider={self.provider}>"
