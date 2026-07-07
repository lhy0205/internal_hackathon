from fastapi import Cookie, HTTPException, status
from app.services.member_service import decode_access_token


def get_current_user(access_token: str | None = Cookie(default=None)) -> dict:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    try:
        payload = decode_access_token(access_token)
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
            "nickname": payload.get("nickname", ""),
        }
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")
