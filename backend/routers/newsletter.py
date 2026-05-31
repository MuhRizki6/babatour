"""Newsletter subscriber CRUD + CSV export."""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timezone
from core.deps import db, get_current_admin

router = APIRouter(prefix="/api", tags=["newsletter"])


class NewsletterIn(BaseModel):
    email: EmailStr
    name: Optional[str] = None


@router.post("/newsletter")
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


@router.get("/admin/newsletter")
async def admin_list_subs(current=Depends(get_current_admin)):
    items = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


@router.delete("/admin/newsletter/{sub_id}")
async def admin_delete_sub(sub_id: str, current=Depends(get_current_admin)):
    res = await db.newsletter.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.get("/admin/newsletter/export")
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
