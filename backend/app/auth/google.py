import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.services.member_service import create_access_token, get_or_create_member

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

SCOPES = "openid email profile"


@router.get("/login", summary="Google 로그인 페이지로 리다이렉트")
def google_login():
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",  # refresh_token 발급을 위해
        "prompt": "select_account",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query_string}")


@router.get("/callback", summary="Google OAuth 콜백 - 쿠키 발급 후 프론트 리다이렉트")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_data = await _exchange_code_for_token(code)
    google_access_token = token_data.get("access_token")
    if not google_access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google 토큰 교환 실패")

    user_info = await _get_google_user_info(google_access_token)
    email = user_info.get("email")
    nickname = user_info.get("name", email)
    provider_id = user_info.get("sub")

    if not email or not provider_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google 사용자 정보를 가져올 수 없습니다.")

    try:
        member, _ = get_or_create_member(db, email=email, nickname=nickname, provider="google", provider_id=provider_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    access_token = create_access_token(member)
    return RedirectResponse(url=f"{settings.frontend_url}?token={access_token}")


async def _exchange_code_for_token(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google 토큰 요청 실패: {response.text}",
        )
    return response.json()


async def _get_google_user_info(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google 사용자 정보 요청 실패: {response.text}",
        )
    return response.json()
