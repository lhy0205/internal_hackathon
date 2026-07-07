from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # SQL 로그 출력 (개발 시 True)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: DB 세션을 요청마다 생성하고 종료 후 닫음"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
