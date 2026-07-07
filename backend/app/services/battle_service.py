"""
배틀 게임 상태 관리 서비스.

현재는 서버 메모리(딕셔너리)에 세션을 저장한다.
TODO: 프로덕션 배포 시 Redis 또는 DB 기반 세션 스토어로 교체 권장.
"""

from dataclasses import dataclass, field
from typing import Optional


# ── 배틀 세션 ──────────────────────────────────────────
@dataclass
class BattleSession:
    battle_id: str
    quest_id: str
    excuse_text: str
    suspicion: int
    turn: int = 0           # 0~3 (최대 3턴)
    is_finished: bool = False
    history: list[dict] = field(default_factory=list)  # AI 컨텍스트용 대화 이력


# 인메모리 세션 저장소
_sessions: dict[str, BattleSession] = {}

MAX_TURNS = 3
INITIAL_SUSPICION = 60


def create_session(quest_id: str, excuse_text: str, battle_id: str, suspicion: int = INITIAL_SUSPICION) -> BattleSession:
    """새 배틀 세션 생성 및 등록. battle_id는 AI 서버에서 발급된 값을 사용."""
    session = BattleSession(
        battle_id=battle_id,
        quest_id=quest_id,
        excuse_text=excuse_text,
        suspicion=suspicion,
    )
    _sessions[battle_id] = session
    return session


def get_session(battle_id: str) -> Optional[BattleSession]:
    return _sessions.get(battle_id)


def is_final_turn(session: BattleSession, new_suspicion: int) -> bool:
    """3턴 소진 또는 의심도 0 이하 도달 시 배틀 종료"""
    return session.turn >= MAX_TURNS or new_suspicion <= 0


def finish_session(battle_id: str) -> None:
    """세션 종료 처리 (필요 시 DB 저장 등 후처리)"""
    session = _sessions.get(battle_id)
    if session:
        session.is_finished = True
