"""Packages public + admin CRUD + PDF download."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from core.deps import db, get_current_admin, BRAND

router = APIRouter(prefix="/api", tags=["packages"])


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


@router.get("/packages/public")
async def public_packages():
    items = await db.packages.find({"published": True}, {"_id": 0}).sort("order", 1).to_list(200)
    return items


@router.get("/packages/public/{pkg_id}")
async def public_package(pkg_id: str):
    doc = await db.packages.find_one({"id": pkg_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    return doc


@router.get("/admin/packages")
async def admin_list_packages(current=Depends(get_current_admin)):
    items = await db.packages.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return items


@router.get("/admin/packages/{pkg_id}")
async def admin_get_package(pkg_id: str, current=Depends(get_current_admin)):
    doc = await db.packages.find_one({"id": pkg_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    return doc


@router.post("/admin/packages")
async def admin_create_package(payload: PackageIn, current=Depends(get_current_admin)):
    from core.deps import slugify
    pid = (payload.id or slugify(payload.name) or uuid.uuid4().hex[:8])
    if await db.packages.find_one({"id": pid}):
        raise HTTPException(400, f"Package id '{pid}' already exists")
    data = payload.model_dump()
    data["id"] = pid
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.insert_one(data)
    return {k: v for k, v in data.items() if k != "_id"}


@router.patch("/admin/packages/{pkg_id}")
async def admin_update_package(pkg_id: str, payload: PackageIn, current=Depends(get_current_admin)):
    existing = await db.packages.find_one({"id": pkg_id})
    if not existing:
        raise HTTPException(404, "Package not found")
    update = payload.model_dump()
    update["id"] = pkg_id
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.update_one({"id": pkg_id}, {"$set": update})
    doc = await db.packages.find_one({"id": pkg_id}, {"_id": 0})
    return doc


@router.delete("/admin/packages/{pkg_id}")
async def admin_delete_package(pkg_id: str, current=Depends(get_current_admin)):
    res = await db.packages.delete_one({"id": pkg_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.get("/packages/{pkg_id}/pdf")
async def package_pdf(pkg_id: str):
    doc = await db.packages.find_one({"id": pkg_id, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Package not found")
    from pdf_render import render_package_pdf
    pdf_bytes = render_package_pdf(doc, BRAND)
    safe = (doc.get("fullTitle") or pkg_id).replace(" ", "_")
    safe = "".join(c for c in safe if ord(c) < 128 and c not in "[]")
    headers = {"Content-Disposition": f'inline; filename="Itinerary_{safe}.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
