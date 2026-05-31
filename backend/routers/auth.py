"""Auth + admin stats."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from core.deps import db, verify_password, create_token, get_current_admin

router = APIRouter(prefix="/api", tags=["auth"])


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@router.post("/auth/login")
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


@router.get("/auth/me")
async def me(current=Depends(get_current_admin)):
    return current


@router.get("/admin/stats")
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
