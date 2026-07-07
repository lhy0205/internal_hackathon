from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import google as google_auth
from app.config import settings
from app.database import Base, engine
from app.models import member, excuse_library, battle_library  # noqa: F401 — 테이블 자동 생성용
from app.routers import auth, battle, battle_library as battle_library_router, excuse, library, user

# 앱 시작 시 테이블 자동 생성 (개발 환경용, 프로덕션은 alembic 마이그레이션 사용)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="변명 생성기 API - Google OAuth 기반 회원가입/로그인",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 라우터 등록
app.include_router(google_auth.router)
app.include_router(auth.router)
app.include_router(excuse.router)
app.include_router(library.router)
app.include_router(battle_library_router.router)
app.include_router(user.router)
app.include_router(battle.router)


@app.get("/", tags=["health"])
def health_check():
    """서버 상태 확인"""
    return {"status": "ok", "app": settings.app_name}
