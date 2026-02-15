from datetime import datetime, timedelta, timezone
import re
from fastapi import APIRouter, Header, HTTPException, status
from app.db.mongo import get_db
from app.core.security import hash_password, verify_password, generate_token
from app.core.config import settings
from app.models.domain import DomainCreate, DomainPublic, DomainUpdate, UnlockRequest, UnlockResponse

router = APIRouter(prefix="/domains", tags=["domains"])

DOMAIN_RE = re.compile(r"^[a-z0-9\-]{3,30}$")


def normalize_domain(value: str) -> str:
    value = value.strip().lower()
    if not DOMAIN_RE.match(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid domain name. Use 3-30 chars: letters, numbers, hyphen.",
        )
    return value


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _as_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


async def _get_domain_or_404(domain: str):
    db = get_db()
    doc = await db.domains.find_one({"_id": domain})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    return doc


def _domain_public(doc) -> DomainPublic:
    return DomainPublic(
        domain=doc["_id"],
        expires_at=doc["expires_at"],
        created_at=doc["created_at"],
        content=doc.get("content", ""),
        meta=doc.get("meta", {}),
        files=doc.get("files", []),
        is_locked=bool(doc.get("password_hash")),
    )


async def _require_access_token(domain: str, token: str | None):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token required")
    db = get_db()
    token_doc = await db.tokens.find_one({"_id": token, "domain": domain})
    if not token_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")
    if _as_aware(token_doc["expires_at"]) <= _now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired")


@router.post("", response_model=DomainPublic, status_code=status.HTTP_201_CREATED)
async def create_domain(payload: DomainCreate):
    db = get_db()
    domain = normalize_domain(payload.domain)
    expires_at = _now() + timedelta(milliseconds=payload.duration_ms)

    doc = {
        "_id": domain,
        "password_hash": hash_password(payload.password) if payload.password else None,
        "expires_at": expires_at,
        "created_at": _now(),
        "content": "<p>Your Sendy clipboard</p>",
        "meta": {"font_size": 18, "color": "#111827", "bold": False},
        "files": [],
    }

    existing = await db.domains.find_one({"_id": domain})
    if existing and _as_aware(existing["expires_at"]) > _now():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Domain already exists")

    await db.domains.replace_one({"_id": domain}, doc, upsert=True)
    return _domain_public(doc)


@router.post("/{domain}/unlock", response_model=UnlockResponse)
async def unlock_domain(domain: str, payload: UnlockRequest):
    domain = normalize_domain(domain)
    doc = await _get_domain_or_404(domain)
    if _as_aware(doc["expires_at"]) <= _now():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Domain expired")
    if not doc.get("password_hash"):
        token = generate_token()
    else:
        if not verify_password(payload.password, doc["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
        token = generate_token()

    expires_at = _now() + timedelta(seconds=settings.access_token_ttl_seconds)
    db = get_db()
    await db.tokens.insert_one(
        {"_id": token, "domain": domain, "expires_at": expires_at, "created_at": _now()}
    )
    return UnlockResponse(token=token, expires_at=expires_at)


@router.get("/{domain}", response_model=DomainPublic)
async def get_domain(domain: str, x_access_token: str | None = Header(default=None)):
    domain = normalize_domain(domain)
    doc = await _get_domain_or_404(domain)
    if _as_aware(doc["expires_at"]) <= _now():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Domain expired")
    if doc.get("password_hash"):
        await _require_access_token(domain, x_access_token)
    return _domain_public(doc)


@router.put("/{domain}", response_model=DomainPublic)
async def update_domain(
    domain: str,
    payload: DomainUpdate,
    x_access_token: str | None = Header(default=None),
):
    domain = normalize_domain(domain)
    doc = await _get_domain_or_404(domain)
    if _as_aware(doc["expires_at"]) <= _now():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Domain expired")
    if doc.get("password_hash"):
        await _require_access_token(domain, x_access_token)

    db = get_db()
    update_doc = {
        "content": payload.content,
        "meta": payload.meta.model_dump(),
        "files": [item.model_dump() for item in payload.files],
    }
    await db.domains.update_one({"_id": domain}, {"$set": update_doc})
    doc.update(update_doc)
    return _domain_public(doc)


@router.delete("/{domain}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(domain: str, x_access_token: str | None = Header(default=None)):
    domain = normalize_domain(domain)
    doc = await _get_domain_or_404(domain)
    if doc.get("password_hash"):
        await _require_access_token(domain, x_access_token)
    db = get_db()
    await db.domains.delete_one({"_id": domain})
    await db.tokens.delete_many({"domain": domain})
    return None
