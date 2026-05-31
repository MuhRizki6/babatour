"""Public inquiry submission + admin management."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from core.deps import db, get_current_admin

router = APIRouter(prefix="/api", tags=["inquiries"])


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
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|contacted|converted|closed)$")


@router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone.strip(),
        package_interest=(payload.package_interest or "").strip() or None,
        message=(payload.message or "").strip() or None,
    )
    doc = inquiry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.inquiries.insert_one(doc)
    return inquiry


@router.get("/admin/inquiries", response_model=List[Inquiry])
async def admin_list_inquiries(current=Depends(get_current_admin)):
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    result = []
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
        it.setdefault("status", "new")
        result.append(Inquiry(**it))
    return result


@router.patch("/admin/inquiries/{inquiry_id}", response_model=Inquiry)
async def admin_update_inquiry(inquiry_id: str, payload: InquiryUpdate, current=Depends(get_current_admin)):
    res = await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    doc.setdefault("status", "new")
    return Inquiry(**doc)


@router.delete("/admin/inquiries/{inquiry_id}")
async def admin_delete_inquiry(inquiry_id: str, current=Depends(get_current_admin)):
    res = await db.inquiries.delete_one({"id": inquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}
