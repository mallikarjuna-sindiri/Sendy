from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongodb_uri: str = Field(..., alias="MONGODB_URI")
    mongodb_db: str = Field("sendy", alias="MONGODB_DB")

    access_token_ttl_seconds: int = Field(3600, alias="ACCESS_TOKEN_TTL_SECONDS")
    cors_origins: str = Field("http://localhost:5173,http://localhost:3000", alias="CORS_ORIGINS")

    s3_access_key_id: str | None = Field(None, alias="S3_ACCESS_KEY_ID")
    s3_secret_access_key: str | None = Field(None, alias="S3_SECRET_ACCESS_KEY")
    s3_bucket: str | None = Field(None, alias="S3_BUCKET")
    s3_region: str | None = Field(None, alias="S3_REGION")
    s3_endpoint_url: str | None = Field(None, alias="S3_ENDPOINT_URL")


settings = Settings()
