# Sendy backend (FastAPI)

## Local setup
1) Create a virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Copy env file and set values:

```bash
cp .env.example .env
```

3) Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API summary
- POST /domains
- POST /domains/{domain}/unlock
- GET /domains/{domain}
- PUT /domains/{domain}
- DELETE /domains/{domain}

## Notes
- MongoDB TTL indexes clean up expired domains and tokens automatically.
- Files are metadata-only for now; storage integration will be added next.
