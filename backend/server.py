"""Slim entrypoint. Mounts routers, runs startup seeds, serves /api/uploads static files."""
from core.deps import db, UPLOAD_DIR, hash_password, verify_password
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import os
import uuid
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


app = FastAPI(title="Baba Tour API")

# CORS first
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers.auth import router as auth_router
from routers.inquiries import router as inquiries_router
from routers.blog import router as blog_router
from routers.packages import router as packages_router
from routers.albums import router as albums_router
from routers.newsletter import router as newsletter_router
from routers.uploads import router as uploads_router

app.include_router(auth_router)
app.include_router(inquiries_router)
app.include_router(blog_router)
app.include_router(packages_router)
app.include_router(albums_router)
app.include_router(newsletter_router)
app.include_router(uploads_router)

# Static uploads
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/api/")
async def root():
    return {"message": "Baba Tour Umroh API"}


# ---------- Seed ----------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@babatour.com").lower()
    pw = os.environ.get("ADMIN_PASSWORD", "admin123")
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
            doc = {**p,
                   "created_at": datetime.now(timezone.utc).isoformat(),
                   "updated_at": datetime.now(timezone.utc).isoformat()}
            await db.packages.insert_one(doc)
            logger.info(f"Seeded package: {p['id']}")


async def seed_albums():
    seed = [
        {
            "slug": "umroh-vip-maret-2026",
            "title": "Umroh VIP Maret 2026",
            "description": "Dokumentasi keberangkatan jamaah Umroh VIP Maret 2026 di Tanah Suci.",
            "cover_image": "https://images.pexels.com/photos/8059446/pexels-photo-8059446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
            "images": [
                "https://images.pexels.com/photos/8059446/pexels-photo-8059446.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
                "https://images.unsplash.com/photo-1646228626691-862369e6a787?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "https://images.unsplash.com/photo-1575751639353-e292e76daca3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
                "https://images.pexels.com/photos/34498854/pexels-photo-34498854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
                "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
            ],
            "event_date": "Maret 2026",
            "order": 1,
        },
        {
            "slug": "umroh-plus-turki-mei-2026",
            "title": "Umroh Plus Turki Mei 2026",
            "description": "Wisata sejarah Islam di Istanbul.",
            "cover_image": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
            "images": [
                "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1668020024175-c1bca87c5a9d?auto=format&fit=crop&w=1200&q=80",
                "https://images.pexels.com/photos/18360295/pexels-photo-18360295.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
                "https://images.unsplash.com/photo-1592326871020-04f58c1a52f3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
            ],
            "event_date": "Mei 2026",
            "order": 2,
        },
        {
            "slug": "haji-khusus-2024",
            "title": "Haji Khusus 2024",
            "description": "Momen-momen ibadah Haji Khusus 2024.",
            "cover_image": "https://images.pexels.com/photos/29102893/pexels-photo-29102893.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
            "images": [
                "https://images.pexels.com/photos/29102893/pexels-photo-29102893.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
                "https://images.pexels.com/photos/33169789/pexels-photo-33169789.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
                "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                "https://images.pexels.com/photos/34498854/pexels-photo-34498854.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200",
            ],
            "event_date": "Juni 2024",
            "order": 3,
        },
    ]
    for a in seed:
        existing = await db.albums.find_one({"slug": a["slug"]})
        if not existing:
            doc = {
                **a,
                "id": str(uuid.uuid4()),
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.albums.insert_one(doc)
            logger.info(f"Seeded album: {a['slug']}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)
    await db.packages.create_index("id", unique=True)
    await db.newsletter.create_index("email", unique=True)
    await db.albums.create_index("slug", unique=True)
    await db.albums.create_index("id", unique=True)
    await seed_admin()
    await seed_packages()
    await seed_albums()
    logger.info("Startup complete — routers mounted, seeds checked.")


@app.on_event("shutdown")
async def on_shutdown():
    from core.deps import client
    client.close()
