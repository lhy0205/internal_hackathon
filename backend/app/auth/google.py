import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.services.member_service import create_access_token, get_or_create_member

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

# Google OAuth 2.0 엔드포인트
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# 요청할 권한 범위: 이메일 + 프로필 이름
SCOPES = "openid email profile"


@router.get("/login", summary="Google 로그인 페이지로 리다이렉트")
def google_login():
    """
    클라이언트가 이 URL을 호출하면 Google 로그인 화면으로 이동한다.
    로그인 완료 후 Google이 /auth/google/callback 으로 code를 전달한다.
    """
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",  # refresh_token 발급을 위해
        "prompt": "select_account",  # 매번 계정 선택 화면 표시
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query_string}")


@router.get("/callback", summary="Google OAuth 콜백 - 쿠키 발급 후 프론트 리다이렉트")
async def google_callback(code: str, db: Session = Depends(get_db)):
    # 1. 인가 코드 → Google access_token 교환
    token_data = await _exchange_code_for_token(code)
    google_access_token = token_data.get("access_token")
    if not google_access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google 토큰 교환 실패")

    # 2. Google 사용자 정보 조회
    user_info = await _get_google_user_info(google_access_token)
    email = user_info.get("email")
    nickname = user_info.get("name", email)
    provider_id = user_info.get("sub")

    if not email or not provider_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google 사용자 정보를 가져올 수 없습니다.")

    # 3. DB 회원 조회 또는 신규 생성
    try:
        member, _ = get_or_create_member(db, email=email, nickname=nickname, provider="google", provider_id=provider_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    # 4. JWT 발급 → HttpOnly 쿠키에 저장 후 프론트 홈으로 리다이렉트
    access_token = create_access_token(member)
    response = RedirectResponse(url=settings.frontend_url)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )
    return response


async def _exchange_code_for_token(code: str) -> dict:
    """Google 인가 코드를 액세스 토큰으로 교환"""
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
    """Google 액세스 토큰으로 사용자 프로필 조회"""
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
