from datetime import datetime, timedelta, timezone

from jose import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.models.member import Member


def get_or_create_member(
    db: Session,
    *,
    email: str,
    nickname: str,
    provider: str,
    provider_id: str,
) -> tuple[Member, bool]:
    member = db.query(Member).filter(
        Member.provider == provider,
        Member.provider_id == provider_id,
    ).first()

    if member:
        return member, False

    existing_by_email = db.query(Member).filter(Member.email == email).first()
    if existing_by_email:
        raise ValueError(f"이미 다른 방식으로 가입된 이메일입니다: {email}")

    new_member = Member(
        email=email,
        nickname=nickname,
        provider=provider,
        provider_id=provider_id,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member, True


def create_access_token(member: Member) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(member.id),
        "email": member.email,
        "nickname": member.nickname,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """JWT 디코드 - 유효하지 않으면 ValueError"""
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except Exception as e:
        raise ValueError(str(e))
