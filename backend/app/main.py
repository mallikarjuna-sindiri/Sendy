from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongo import get_db
from app.routes.domains import router as domains_router


app = FastAPI(title="Sendy API")

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(domains_router)


@app.on_event("startup")
async def startup_indexes():
    db = get_db()
    await db.domains.create_index("expires_at", expireAfterSeconds=0)
    await db.tokens.create_index("expires_at", expireAfterSeconds=0)
