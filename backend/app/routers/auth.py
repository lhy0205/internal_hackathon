from fastapi import APIRouter, Cookie, HTTPException, status
from fastapi.responses import JSONResponse

from app.services.member_service import decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _get_user_from_cookie(access_token: str | None) -> dict:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    try:
        payload = decode_access_token(access_token)
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
            "nickname": payload.get("nickname", payload["email"]),
            "provider": "google",
        }
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")


@router.get("/me", summary="현재 로그인 유저 정보")
def get_me(access_token: str | None = Cookie(default=None)):
    return _get_user_from_cookie(access_token)


@router.post("/logout", summary="로그아웃 - 쿠키 삭제")
def logout():
    response = JSONResponse(content={"message": "로그아웃 완료"})
    response.delete_cookie(key="access_token")
    return response
