from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Member(Base):
    """
    회원 테이블
    - 기본 회원가입 없이 Google OAuth 전용
    - provider: 현재는 "google" 고정, 추후 kakao 등 확장 가능
    - provider_id: Google 고유 유저 ID (sub)
    - email: Google 계정 이메일
    - nickname: Google 프로필 이름 (최초 가입 시 자동 설정, 이후 수정 가능)
    """

    __tablename__ = "member"

    # SQLite 호환을 위해 Integer 사용 (MySQL 배포 시 BigInteger로 변경)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(20), nullable=False)        # "google"
    provider_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)  # Google sub

    def __repr__(self) -> str:
        return f"<Member id={self.id} email={self.email} provider={self.provider}>"
