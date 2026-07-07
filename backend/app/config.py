from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ExcuseMe API"
    debug: bool = False

    database_url: str

    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    frontend_url: str = "http://localhost:3000"

    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    gpt_api_key: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
