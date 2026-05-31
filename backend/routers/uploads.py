"""Image upload with server-side optimization (WebP @ max 1600px)."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
import uuid
import os
import io
from core.deps import get_current_admin, UPLOAD_DIR
from PIL import Image, ImageOps

router = APIRouter(prefix="/api/admin", tags=["uploads"])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
MAX_UPLOAD_MB = 10
MAX_WIDTH = 1600
WEBP_QUALITY = 85


def _optimize_to_webp(raw: bytes) -> bytes:
    """Open image, downscale if width > MAX_WIDTH, return WebP bytes."""
    img = Image.open(io.BytesIO(raw))
    # Apply EXIF rotation to keep orientation correct
    img = ImageOps.exif_transpose(img)
    # Convert palette/RGBA -> RGB while preserving alpha for WebP (WebP supports alpha)
    if img.mode == "P":
        img = img.convert("RGBA")
    elif img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        new_h = int(img.height * ratio)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="WEBP", quality=WEBP_QUALITY, method=6)
    return out.getvalue()


def _save_one(file_bytes: bytes, original_name: str) -> dict:
    name = (original_name or "").lower()
    ext = "." + name.rsplit(".", 1)[-1] if "." in name else ""
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXT))}")
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(400, f"File too large ({size_mb:.1f} MB). Max {MAX_UPLOAD_MB} MB.")

    optimized: bytes
    final_ext = ".webp"
    if ext == ".gif":
        # GIF stays GIF to preserve animation
        optimized = file_bytes
        final_ext = ".gif"
    else:
        try:
            optimized = _optimize_to_webp(file_bytes)
        except Exception as e:
            # Refuse to save a file we couldn't decode — prevents pseudo-image uploads
            raise HTTPException(400, f"Could not process image: {e}") from e

    new_name = f"{uuid.uuid4().hex}{final_ext}"
    target = UPLOAD_DIR / new_name
    with open(target, "wb") as f:
        f.write(optimized)

    base = os.environ.get("PUBLIC_BACKEND_URL", "").rstrip("/")
    url = f"{base}/api/uploads/{new_name}" if base else f"/api/uploads/{new_name}"

    return {
        "url": url,
        "filename": new_name,
        "size": len(optimized),
        "original_size": len(file_bytes),
        "optimized": final_ext == ".webp",
    }


@router.post("/upload")
async def admin_upload_image(file: UploadFile = File(...), current=Depends(get_current_admin)):
    contents = await file.read()
    return _save_one(contents, file.filename or "")


@router.post("/upload/bulk")
async def admin_upload_bulk(files: List[UploadFile] = File(...), current=Depends(get_current_admin)):
    if len(files) > 20:
        raise HTTPException(400, "Max 20 files per batch.")
    results = []
    errors = []
    for f in files:
        try:
            data = await f.read()
            results.append(_save_one(data, f.filename or ""))
        except HTTPException as e:
            errors.append({"filename": f.filename, "error": e.detail})
        except Exception as e:
            errors.append({"filename": f.filename, "error": str(e)})
    return {"uploaded": results, "errors": errors, "count": len(results)}
