import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import boto3
import jwt
from botocore.config import Config as BotoConfig
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-secret")
JWT_ALG = "HS256"
TOKEN_HOURS = 24
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@lioneyo.com").strip().lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

MONGO_URL = os.environ.get("MONGO_URL", "").strip()
DB_NAME = os.environ.get("DB_NAME", "lioneyo").strip()

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "").strip()
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "").strip()
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "").strip()
R2_BUCKET = os.environ.get("R2_BUCKET", "lioneyo-media").strip()
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "").strip().rstrip("/")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL is required")

if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL]):
    raise RuntimeError(
        "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_PUBLIC_URL are required"
    )

mongo_client = MongoClient(MONGO_URL)
db = mongo_client[DB_NAME]
content_collection = db["site_content"]

r2_client = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=BotoConfig(signature_version="s3v4"),
    region_name="auto",
)

DEFAULT_CONTENT: dict[str, Any] = {
    "brand": {
        "name": "LIONEYO",
        "tagline": "Streetwear rebuilt for clean deployment",
        "whatsapp": "https://wa.me/919999999999",
        "email": "mailto:hello@lioneyo.com",
    },
    "hero": {
        "eyebrow": "Fresh Build. Better Foundation.",
        "title": "Streetwear store that looks sharp and is actually easy to deploy.",
        "description": "Yeh naya version static-first hai, isliye Hostinger par direct chal sakta hai. Jab ready ho, hum backend aur payments baad me clean tareeke se add kar denge.",
        "primaryCta": "Explore Drops",
        "secondaryCta": "Setup My Store",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        "spotlight": "Campus streetwear with premium energy, not template vibes.",
    },
    "products": [
        {
            "id": 1,
            "name": "Voltage Oversized Tee",
            "category": "Oversized",
            "price": 1499,
            "tag": "Best Seller",
            "color": "Midnight Black",
            "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": 2,
            "name": "IIT Core Hoodie",
            "category": "Campus",
            "price": 2499,
            "tag": "New Drop",
            "color": "Concrete Grey",
            "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": 3,
            "name": "Shinobi Panel Tee",
            "category": "Anime",
            "price": 1699,
            "tag": "Limited",
            "color": "Deep Indigo",
            "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "collections": [
        {
            "id": 1,
            "name": "Campus Code",
            "subtitle": "Smart, clean essentials for college days that still feel premium.",
            "image": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        },
        {
            "id": 2,
            "name": "Oversized Motion",
            "subtitle": "Relaxed silhouettes with strong graphics and heavyweight feel.",
            "image": "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
        },
        {
            "id": 3,
            "name": "Anime Signal",
            "subtitle": "Graphic-led drops made for fans who want edge, not costume.",
            "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
        },
    ],
    "reviews": [
        {
            "id": 1,
            "name": "Aarav",
            "text": "Yeh finally aisi brand feel hoti hai jo student budget aur premium vibe dono balance karti hai.",
        },
        {
            "id": 2,
            "name": "Riya",
            "text": "Fabric aur layout dono classy lage. Website bhi fast hai aur products clear dikhte hain.",
        },
        {
            "id": 3,
            "name": "Ishaan",
            "text": "Mujhe direct no-noise store chahiye tha. Is version me woh clean confidence aa raha hai.",
        },
    ],
    "steps": [
        "Drop choose karo",
        "WhatsApp ya Instagram par order confirm karo",
        "Manual payment ya COD flow set karo",
        "Delivery updates directly share karo",
    ],
}


class LoginPayload(BaseModel):
    email: str
    password: str


class ContentPayload(BaseModel):
    brand: dict[str, Any]
    hero: dict[str, Any]
    products: list[dict[str, Any]]
    collections: list[dict[str, Any]]
    reviews: list[dict[str, Any]]
    steps: list[str]


def ensure_seed_content() -> None:
    existing = content_collection.find_one({"key": "main"}, {"_id": 0})
    if existing:
        return

    content_collection.insert_one(
        {
            "key": "main",
            "content": DEFAULT_CONTENT,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
    )


def read_content() -> dict[str, Any]:
    ensure_seed_content()
    record = content_collection.find_one({"key": "main"}, {"_id": 0, "key": 0})
    if not record:
        return DEFAULT_CONTENT

    content = record.get("content", DEFAULT_CONTENT)
    if "updatedAt" in record:
        content["updatedAt"] = record["updatedAt"]
    return content


def write_content(content: dict[str, Any]) -> dict[str, Any]:
    updated_at = datetime.now(timezone.utc).isoformat()
    content_collection.update_one(
        {"key": "main"},
        {"$set": {"content": content, "updatedAt": updated_at}},
        upsert=True,
    )
    return {**content, "updatedAt": updated_at}


def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "type": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def get_current_admin(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    if payload.get("sub") != ADMIN_EMAIL or payload.get("type") != "admin":
        raise HTTPException(status_code=401, detail="Invalid admin")

    return ADMIN_EMAIL


def upload_to_r2(file: UploadFile) -> dict[str, str]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    filename = (
        f"lioneyo/{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-"
        f"{uuid.uuid4().hex}{suffix}"
    )
    body = file.file.read()
    content_type = file.content_type or "application/octet-stream"

    r2_client.put_object(
        Bucket=R2_BUCKET,
        Key=filename,
        Body=body,
        ContentType=content_type,
    )

    return {"url": f"{R2_PUBLIC_URL}/{filename}", "filename": filename}


app = FastAPI(title="Lioneyo CMS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "running"}


@app.get("/api/content")
def get_content() -> dict[str, Any]:
    return read_content()


@app.post("/api/auth/login")
def login(payload: LoginPayload) -> dict[str, Any]:
    email = payload.email.strip().lower()
    if email != ADMIN_EMAIL or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(email)
    return {
        "token": token,
        "user": {"email": ADMIN_EMAIL, "role": "admin"},
    }


@app.get("/api/auth/me")
def me(admin: str = Depends(get_current_admin)) -> dict[str, str]:
    return {"email": admin, "role": "admin"}


@app.put("/api/admin/content")
def update_content(
    payload: ContentPayload,
    admin: str = Depends(get_current_admin),
) -> dict[str, Any]:
    return write_content(payload.model_dump())


@app.post("/api/admin/upload")
def upload_file(
    file: UploadFile = File(...),
    admin: str = Depends(get_current_admin),
) -> dict[str, str]:
    return upload_to_r2(file)


@app.post("/api/admin/reset")
def reset_content(admin: str = Depends(get_current_admin)) -> dict[str, Any]:
    return write_content(DEFAULT_CONTENT)
