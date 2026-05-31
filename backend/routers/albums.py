"""Albums (gallery) public + admin CRUD."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from core.deps import db, get_current_admin, slugify

router = APIRouter(prefix="/api", tags=["albums"])


class AlbumIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = ""
    cover_image: Optional[str] = ""
    images: List[str] = Field(default_factory=list)
    event_date: Optional[str] = ""
    published: bool = True
    order: int = 99


@router.get("/albums/public")
async def public_albums():
    items = await db.albums.find({"published": True}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(200)
    return items


@router.get("/albums/public/{slug}")
async def public_album(slug: str):
    doc = await db.albums.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Album not found")
    return doc


@router.get("/admin/albums")
async def admin_list_albums(current=Depends(get_current_admin)):
    items = await db.albums.find({}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(500)
    return items


@router.get("/admin/albums/{album_id}")
async def admin_get_album(album_id: str, current=Depends(get_current_admin)):
    doc = await db.albums.find_one({"id": album_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Album not found")
    return doc


@router.post("/admin/albums")
async def admin_create_album(payload: AlbumIn, current=Depends(get_current_admin)):
    slug = slugify(payload.slug or payload.title)
    base = slug; n = 1
    while await db.albums.find_one({"slug": slug}):
        n += 1; slug = f"{base}-{n}"
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = slug
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    if not doc.get("cover_image") and doc.get("images"):
        doc["cover_image"] = doc["images"][0]
    await db.albums.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@router.patch("/admin/albums/{album_id}")
async def admin_update_album(album_id: str, payload: AlbumIn, current=Depends(get_current_admin)):
    existing = await db.albums.find_one({"id": album_id})
    if not existing:
        raise HTTPException(404, "Album not found")
    new_slug = slugify(payload.slug) if payload.slug else existing["slug"]
    if new_slug != existing["slug"]:
        base = new_slug; n = 1
        while await db.albums.find_one({"slug": new_slug, "id": {"$ne": album_id}}):
            n += 1; new_slug = f"{base}-{n}"
    update = payload.model_dump()
    update["slug"] = new_slug
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    if not update.get("cover_image") and update.get("images"):
        update["cover_image"] = update["images"][0]
    await db.albums.update_one({"id": album_id}, {"$set": update})
    doc = await db.albums.find_one({"id": album_id}, {"_id": 0})
    return doc


@router.delete("/admin/albums/{album_id}")
async def admin_delete_album(album_id: str, current=Depends(get_current_admin)):
    res = await db.albums.delete_one({"id": album_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}
