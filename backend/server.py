from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import re
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt as pyjwt


# ---------- Logging ----------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# ---------- Constants ----------
JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGORITHM = 'HS256'
TOKEN_DAYS = 7


# ---------- Auth helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
        'iat': datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Not authenticated')
    token = auth[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
    user = await db.users.find_one({'id': payload['sub']}, {'_id': 0, 'password_hash': 0})
    if not user or user.get('role') != 'admin':
        raise HTTPException(status_code=401, detail='User not found')
    return user


# ---------- App ----------
app = FastAPI(title="Baba Tour API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)
    package_interest: Optional[str] = Field(default=None, max_length=120)
    message: Optional[str] = Field(default=None, max_length=2000)


class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    package_interest: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"  # new | contacted | converted | closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|contacted|converted|closed)$")


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class BlogIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = None
    excerpt: Optional[str] = Field(default="", max_length=500)
    content: str = Field(..., min_length=1)
    cover_image: Optional[str] = None
    published: bool = True


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str = ""
    content: str
    cover_image: Optional[str] = None
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:80] or uuid.uuid4().hex[:8]


# ---------- Public routes ----------
@api_router.get("/")
async def root():
    return {"message": "Baba Tour Umroh API"}


@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        package_interest=(payload.package_interest or "").strip() or None,
        message=(payload.message or "").strip() or None,
    )
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    return inquiry


@api_router.get("/blog/public", response_model=List[BlogPost])
async def public_blog_list():
    items = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [_blog_from_doc(d) for d in items]


@api_router.get("/blog/public/{slug}", response_model=BlogPost)
async def public_blog_detail(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Article not found")
    return _blog_from_doc(doc)


def _blog_from_doc(d: dict) -> BlogPost:
    for k in ("created_at", "updated_at"):
        if isinstance(d.get(k), str):
            d[k] = datetime.fromisoformat(d[k])
    return BlogPost(**d)


# ---------- Auth ----------
@api_router.post("/auth/login")
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", "Admin"),
            "role": user.get("role", "admin"),
        },
    }


@api_router.get("/auth/me")
async def me(current=Depends(get_current_admin)):
    return current


# ---------- Admin: Inquiries ----------
@api_router.get("/admin/inquiries", response_model=List[Inquiry])
async def admin_list_inquiries(current=Depends(get_current_admin)):
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    result = []
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
        it.setdefault('status', 'new')
        result.append(Inquiry(**it))
    return result


@api_router.patch("/admin/inquiries/{inquiry_id}", response_model=Inquiry)
async def admin_update_inquiry(inquiry_id: str, payload: InquiryUpdate, current=Depends(get_current_admin)):
    res = await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    doc.setdefault('status', 'new')
    return Inquiry(**doc)


@api_router.delete("/admin/inquiries/{inquiry_id}")
async def admin_delete_inquiry(inquiry_id: str, current=Depends(get_current_admin)):
    res = await db.inquiries.delete_one({"id": inquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- Admin: Blog ----------
@api_router.get("/admin/blog", response_model=List[BlogPost])
async def admin_list_blog(current=Depends(get_current_admin)):
    items = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_blog_from_doc(d) for d in items]


@api_router.post("/admin/blog", response_model=BlogPost)
async def admin_create_blog(payload: BlogIn, current=Depends(get_current_admin)):
    slug = slugify(payload.slug or payload.title)
    # ensure unique
    base = slug
    n = 1
    while await db.blog_posts.find_one({"slug": slug}):
        n += 1
        slug = f"{base}-{n}"
    post = BlogPost(
        title=payload.title.strip(),
        slug=slug,
        excerpt=(payload.excerpt or "").strip(),
        content=payload.content,
        cover_image=payload.cover_image,
        published=payload.published,
    )
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_posts.insert_one(doc)
    return post


@api_router.patch("/admin/blog/{post_id}", response_model=BlogPost)
async def admin_update_blog(post_id: str, payload: BlogIn, current=Depends(get_current_admin)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Post not found")
    new_slug = slugify(payload.slug) if payload.slug else existing["slug"]
    if new_slug != existing["slug"]:
        base = new_slug
        n = 1
        while await db.blog_posts.find_one({"slug": new_slug, "id": {"$ne": post_id}}):
            n += 1
            new_slug = f"{base}-{n}"
    update = {
        "title": payload.title.strip(),
        "slug": new_slug,
        "excerpt": (payload.excerpt or "").strip(),
        "content": payload.content,
        "cover_image": payload.cover_image,
        "published": payload.published,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    doc = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    return _blog_from_doc(doc)


@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_blog(post_id: str, current=Depends(get_current_admin)):
    res = await db.blog_posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(current=Depends(get_current_admin)):
    total_inq = await db.inquiries.count_documents({})
    new_inq = await db.inquiries.count_documents({"status": "new"})
    converted = await db.inquiries.count_documents({"status": "converted"})
    posts = await db.blog_posts.count_documents({})
    return {
        "total_inquiries": total_inq,
        "new_inquiries": new_inq,
        "converted": converted,
        "blog_posts": posts,
    }


# ---------- Startup ----------
async def seed_admin():
    email = os.environ.get('ADMIN_EMAIL', 'admin@babatour.com').lower()
    pw = os.environ.get('ADMIN_PASSWORD', 'admin123')
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(pw),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {email}")
    elif not verify_password(pw, existing.get("password_hash", "")):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pw)}})
        logger.info(f"Updated admin password: {email}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
