from fastapi import APIRouter, Cookie, Header, HTTPException, status
from fastapi.responses import JSONResponse

from app.services.member_service import decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _decode_token(access_token: str | None, authorization: str | None) -> dict:
    token = access_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    try:
        payload = decode_access_token(token)
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
            "nickname": payload.get("nickname", payload["email"]),
            "provider": "google",
        }
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")


@router.get("/me", summary="현재 로그인 유저 정보")
def get_me(
    access_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
):
    return _decode_token(access_token, authorization)


@router.post("/logout", summary="로그아웃")
def logout():
    response = JSONResponse(content={"message": "로그아웃 완료"})
    response.delete_cookie(key="access_token")
    return response
