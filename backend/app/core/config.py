from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql://tradeflow:tradeflow@localhost:5432/tradeflow"
    SECRET_KEY: str = "dev-secret-key-change-in-production-tradeflow-2026"
    SESSION_COOKIE_NAME: str = "tradeflow_session"
    CSRF_COOKIE_NAME: str = "tradeflow_csrf"
    SESSION_EXPIRE_HOURS: int = 24
    ORDER_EXPIRY_MINUTES: int = 5
    RULE_EVAL_INTERVAL_SECONDS: int = 30

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    ENABLE_YFINANCE: bool = False

    ANTHROPIC_API_KEY: str = ""
    POLLINATIONS_API_KEY: str = ""
    POLLINATIONS_MODEL: str = "openai/gpt-5.4-nano"
    POLLINATIONS_BASE_URL: str = "https://gen.pollinations.ai/v1"
    SARVAM_API_KEY: str = ""
    WISPR_API_KEY: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
