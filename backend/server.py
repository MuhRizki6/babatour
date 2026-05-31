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
    pkgs = await db.packages.count_documents({})
    subs = await db.newsletter.count_documents({})
    return {
        "total_inquiries": total_inq,
        "new_inquiries": new_inq,
        "converted": converted,
        "blog_posts": posts,
        "packages": pkgs,
        "subscribers": subs,
    }


# ========== Packages ==========
class PackageIn(BaseModel):
    id: Optional[str] = None
    name: str
    fullTitle: str
    subtitle: Optional[str] = ""
    headline: Optional[str] = ""
    badge: Optional[str] = ""
    badgeLong: Optional[str] = ""
    duration: Optional[str] = ""
    durasi: Optional[str] = ""
    tipePaket: Optional[str] = "Umroh"
    departures: Optional[str] = ""
    departureDate: Optional[str] = ""
    returnDate: Optional[str] = ""
    departureCity: Optional[str] = ""
    availableSeats: Optional[int] = 0
    priceFrom: Optional[str] = ""
    airline: Optional[str] = ""
    hotelMakkah: Optional[str] = ""
    hotelMadinah: Optional[str] = ""
    image: Optional[str] = ""
    gallery: List[str] = Field(default_factory=list)
    overview: Optional[str] = ""
    routes: List[str] = Field(default_factory=list)
    bonuses: List[dict] = Field(default_factory=list)
    pembimbing: Optional[str] = ""
    highlights: List[str] = Field(default_factory=list)
    includes: List[str] = Field(default_factory=list)
    excludes: List[str] = Field(default_factory=list)
    terms: List[str] = Field(default_factory=list)
    hotels: List[dict] = Field(default_factory=list)
    flights: List[dict] = Field(default_factory=list)
    transports: List[dict] = Field(default_factory=list)
    itinerary: List[dict] = Field(default_factory=list)
    published: bool = True
    order: int = 99


def _pkg_clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc = {k: v for k, v in doc.items() if k != "_id"}
    return doc


@api_router.get("/packages/public")
async def public_packages():
    items = await db.packages.find({"published": True}, {"_id": 0}).sort("order", 1).to_list(200)
    return items


@api_router.get("/packages/public/{pkg_id}")
async def public_package(pkg_id: str):
    doc = await db.packages.find_one({"id": pkg_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    return doc


@api_router.get("/admin/packages")
async def admin_list_packages(current=Depends(get_current_admin)):
    items = await db.packages.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return items


@api_router.get("/admin/packages/{pkg_id}")
async def admin_get_package(pkg_id: str, current=Depends(get_current_admin)):
    doc = await db.packages.find_one({"id": pkg_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    return doc


@api_router.post("/admin/packages")
async def admin_create_package(payload: PackageIn, current=Depends(get_current_admin)):
    pid = (payload.id or slugify(payload.name) or uuid.uuid4().hex[:8])
    if await db.packages.find_one({"id": pid}):
        raise HTTPException(400, f"Package id '{pid}' already exists")
    data = payload.model_dump()
    data["id"] = pid
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.insert_one(data)
    return {k: v for k, v in data.items() if k != "_id"}


@api_router.patch("/admin/packages/{pkg_id}")
async def admin_update_package(pkg_id: str, payload: PackageIn, current=Depends(get_current_admin)):
    existing = await db.packages.find_one({"id": pkg_id})
    if not existing:
        raise HTTPException(404, "Package not found")
    update = payload.model_dump()
    update["id"] = pkg_id  # don't allow id change here
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.update_one({"id": pkg_id}, {"$set": update})
    doc = await db.packages.find_one({"id": pkg_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/packages/{pkg_id}")
async def admin_delete_package(pkg_id: str, current=Depends(get_current_admin)):
    res = await db.packages.delete_one({"id": pkg_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ========== PDF download ==========
from fastapi.responses import Response

BRAND = {
    "name": "Baba Tour",
    "fullName": "Baba Tour Umroh & Haji Khusus",
    "phone": "+62 823 9215 6538",
    "email": "babatour.batam@gmail.com",
    "address": "Ruko Mega Legenda 2 Blok B2 No 26, Batam",
}


@api_router.get("/packages/{pkg_id}/pdf")
async def package_pdf(pkg_id: str):
    doc = await db.packages.find_one({"id": pkg_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    from pdf_render import render_package_pdf
    pdf_bytes = render_package_pdf(doc, BRAND)
    raw_name = (doc.get("fullTitle") or pkg_id).replace(" ", "_").replace("[", "").replace("]", "")
    # Content-Disposition must be latin-1 safe; strip non-ASCII (e.g., em-dash)
    safe_name = raw_name.encode("ascii", "ignore").decode("ascii") or pkg_id
    headers = {"Content-Disposition": f'inline; filename="Itinerary_{safe_name}.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


# ========== Newsletter ==========
class NewsletterIn(BaseModel):
    email: EmailStr
    name: Optional[str] = None


@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterIn):
    email = payload.email.lower()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"ok": True, "message": "Already subscribed", "alreadySubscribed": True}
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": (payload.name or "").strip() or None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.newsletter.insert_one(doc)
    return {"ok": True, "message": "Subscribed", "alreadySubscribed": False}


@api_router.get("/admin/newsletter")
async def admin_list_subs(current=Depends(get_current_admin)):
    items = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


@api_router.delete("/admin/newsletter/{sub_id}")
async def admin_delete_sub(sub_id: str, current=Depends(get_current_admin)):
    res = await db.newsletter.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.get("/admin/newsletter/export")
async def admin_export_subs(current=Depends(get_current_admin)):
    items = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    lines = ["email,name,created_at"]
    for it in items:
        name = (it.get("name") or "").replace(",", " ").replace('"', "'")
        lines.append(f'{it.get("email","")},{name},{it.get("created_at","")}')
    csv = "\n".join(lines)
    return Response(
        content=csv,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="newsletter_subscribers.csv"'},
    )


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


async def seed_packages():
    from seed_packages import SEED_PACKAGES
    for p in SEED_PACKAGES:
        existing = await db.packages.find_one({"id": p["id"]})
        if not existing:
            doc = {**p, "created_at": datetime.now(timezone.utc).isoformat(),
                   "updated_at": datetime.now(timezone.utc).isoformat()}
            await db.packages.insert_one(doc)
            logger.info(f"Seeded package: {p['id']}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)
    await db.packages.create_index("id", unique=True)
    await db.newsletter.create_index("email", unique=True)
    await seed_admin()
    await seed_packages()


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
