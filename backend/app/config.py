from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./nis.db"
    jwt_secret: str = "development-only-change-me"
    cors_origins: str = "http://localhost:5173,http://localhost:8080"
    upload_dir: str = "./uploads"
    max_upload_bytes: int = 15 * 1024 * 1024  # 15 MB
    initial_admin_username: str | None = None
    initial_admin_password: str | None = None

settings = Settings()
