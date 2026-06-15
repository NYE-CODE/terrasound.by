from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./terrasound.db"
    secret_key: str = "dev-secret-key-change-in-production"
    admin_username: str = "admin"
    admin_password: str = "admin"
    cors_origins: str = (
        "http://localhost:5173,http://localhost:5174,http://localhost:5175,"
        "https://terrasound.by,https://www.terrasound.by,https://admin.terrasound.by"
    )
    access_token_expire_minutes: int = 480
    site_origin: str = "https://terrasound.by"
    environment: str = "development"
    trust_proxy_headers: bool = False
    uploads_dir: str = "uploads"
    enable_leads_admin_api: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    notification_email: str = ""

    @property
    def smtp_from_address(self) -> str:
        return (self.smtp_from or self.smtp_user).strip()

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host.strip() and self.smtp_from_address)

    @property
    def uploads_path(self):
        from pathlib import Path

        raw = Path(self.uploads_dir)
        if raw.is_absolute():
            return raw
        repo_root = Path(__file__).resolve().parent.parent.parent
        return (repo_root / raw).resolve()

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
