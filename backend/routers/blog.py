"""Blog public + admin CRUD."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from core.deps import db, get_current_admin, slugify

router = APIRouter(prefix="/api", tags=["blog"])


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


def _from_doc(d: dict) -> BlogPost:
    for k in ("created_at", "updated_at"):
        if isinstance(d.get(k), str):
            d[k] = datetime.fromisoformat(d[k])
    return BlogPost(**d)


@router.get("/blog/public", response_model=List[BlogPost])
async def public_blog_list():
    items = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [_from_doc(d) for d in items]


@router.get("/blog/public/{slug}", response_model=BlogPost)
async def public_blog_detail(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Article not found")
    return _from_doc(doc)


@router.get("/admin/blog", response_model=List[BlogPost])
async def admin_list_blog(current=Depends(get_current_admin)):
    items = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_from_doc(d) for d in items]


@router.post("/admin/blog", response_model=BlogPost)
async def admin_create_blog(payload: BlogIn, current=Depends(get_current_admin)):
    slug = slugify(payload.slug or payload.title)
    base = slug; n = 1
    while await db.blog_posts.find_one({"slug": slug}):
        n += 1; slug = f"{base}-{n}"
    post = BlogPost(
        title=payload.title.strip(),
        slug=slug,
        excerpt=(payload.excerpt or "").strip(),
        content=payload.content,
        cover_image=payload.cover_image,
        published=payload.published,
    )
    doc = post.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.blog_posts.insert_one(doc)
    return post


@router.patch("/admin/blog/{post_id}", response_model=BlogPost)
async def admin_update_blog(post_id: str, payload: BlogIn, current=Depends(get_current_admin)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Post not found")
    new_slug = slugify(payload.slug) if payload.slug else existing["slug"]
    if new_slug != existing["slug"]:
        base = new_slug; n = 1
        while await db.blog_posts.find_one({"slug": new_slug, "id": {"$ne": post_id}}):
            n += 1; new_slug = f"{base}-{n}"
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
    return _from_doc(doc)


@router.delete("/admin/blog/{post_id}")
async def admin_delete_blog(post_id: str, current=Depends(get_current_admin)):
    res = await db.blog_posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}
