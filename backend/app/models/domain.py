from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FileMeta(BaseModel):
    id: str
    name: str
    size: int
    type: str
    url: Optional[str] = None
    uploaded_at: datetime


class DomainMeta(BaseModel):
    font_size: int = 18
    color: str = "#111827"
    bold: bool = False


class DomainCreate(BaseModel):
    domain: str
    password: Optional[str] = None
    duration_ms: int = Field(3600000, ge=60000)


class DomainUpdate(BaseModel):
    content: str
    meta: DomainMeta
    files: List[FileMeta] = []


class DomainPublic(BaseModel):
    domain: str
    expires_at: datetime
    created_at: datetime
    content: str
    meta: DomainMeta
    files: List[FileMeta]
    is_locked: bool


class UnlockRequest(BaseModel):
    password: str


class UnlockResponse(BaseModel):
    token: str
    expires_at: datetime
