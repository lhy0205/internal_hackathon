from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # 앱 기본
    app_name: str = "ExcuseMe API"
    debug: bool = False

    # 데이터베이스
    database_url: str  # e.g. mysql+pymysql://user:pass@localhost:3306/excuseme

    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str 

    # 프론트엔드 URL (OAuth 콜백 후 리다이렉트 대상)
    frontend_url: str = "http://localhost:3000"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # GPT API
    gpt_api_key: str

    # JWT (로그인 후 발급할 액세스 토큰)
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
