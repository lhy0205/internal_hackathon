from fastapi import APIRouter

from app.schemas.user import (
    AchievementItem,
    HistoryItem,
    UserProfileResponse,
    UserStatItem,
)

router = APIRouter(prefix="/api/user", tags=["User"])

# TODO: 모든 엔드포인트 - JWT 인증 미들웨어 추가 후 실제 유저 데이터로 교체


# ── GET /api/user/profile ──────────────────────────────────────────────────────
@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="유저 프로필 조회",
)
def get_user_profile():
    """
    TODO: JWT에서 user_id 추출 후 DB 조회로 교체
    """
    return UserProfileResponse(
        name="탈주러",
        level=7,
        title="단골 불참자",
        xp=320,
        xp_max=500,     # 프론트에서 xpMax로 읽음
        coins=1240,
        mp=86,
    )


# ── GET /api/user/stats ────────────────────────────────────────────────────────
@router.get(
    "/stats",
    response_model=list[UserStatItem],
    summary="유저 통계 3종",
)
def get_user_stats():
    """
    TODO: JWT에서 user_id 추출 후 DB 집계 쿼리로 교체
    """
    return [
        UserStatItem(value="14", label="수집 변명", color="lime"),
        UserStatItem(value="23", label="배틀 승리", color="cyan"),
        UserStatItem(value="7",  label="연속 탈출", color="pink"),
    ]


# ── GET /api/user/achievements ─────────────────────────────────────────────────
@router.get(
    "/achievements",
    response_model=list[AchievementItem],
    summary="업적 목록",
)
def get_user_achievements():
    """
    TODO: JWT에서 user_id 추출 후 DB 업적 테이블로 교체
    """
    return [
        AchievementItem(
            icon="🏃",
            name="첫 번째 탈출",
            desc="변명 1회 소환 성공",
            done=True,
        ),
        AchievementItem(
            icon="👑",
            name="S랭크 수집가",
            desc="S랭크 변명 5개 수집",
            done=False,
        ),
        AchievementItem(
            icon="🎯",
            name="배틀 마스터",
            desc="배틀 10회 승리",
            done=False,
        ),
        AchievementItem(
            icon="📚",
            name="도감 완성",
            desc="변명 60개 전부 수집",
            done=False,
        ),
    ]


# ── GET /api/user/history ──────────────────────────────────────────────────────
@router.get(
    "/history",
    response_model=list[HistoryItem],
    summary="최근 소환 기록",
)
def get_user_history():
    """
    TODO: JWT에서 user_id 추출 후 소환 이력 DB 테이블로 교체
    """
    return [
        HistoryItem(
            rank="S",
            rank_color="gold",
            text="노트북이 먹통이라…",
            date="06/22",
        ),
        HistoryItem(
            rank="A",
            rank_color="purple",
            text="가족 응급상황이 생겨서…",
            date="06/20",
        ),
        HistoryItem(
            rank="F",
            rank_color="red",
            text="갑자기 몸이…",
            date="06/18",
        ),
    ]
