"""Iteration 6: Image upload endpoint tests."""
import io
import os
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://umrah-landing.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@babatour.com"
ADMIN_PASSWORD = "BabaTour2026!"


def _png_bytes(w=2, h=2):
    """Create a minimal valid PNG (in-memory)."""
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    raw = b"".join(b"\x00" + b"\xff\x00\x00" * w for _ in range(h))
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# -------- Upload endpoint tests --------

class TestUpload:
    def test_upload_without_auth_returns_401(self):
        files = {"file": ("a.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, timeout=15)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"

    def test_upload_valid_png(self, auth_headers):
        files = {"file": ("test.png", _png_bytes(), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "url" in data and "filename" in data and "size" in data
        # url path should contain /api/uploads/
        assert "/api/uploads/" in data["url"], f"URL missing /api/uploads/: {data['url']}"
        assert data["filename"].endswith(".png")
        assert data["size"] > 0

        # GET fetch the file
        filename = data["filename"]
        get_url = f"{BASE_URL}/api/uploads/{filename}"
        g = requests.get(get_url, timeout=15)
        assert g.status_code == 200, f"GET uploaded file failed: {g.status_code}"
        assert len(g.content) == data["size"]
        # First 8 bytes are PNG signature
        assert g.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_upload_rejects_txt(self, auth_headers):
        files = {"file": ("hello.txt", b"hello world", "text/plain")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=15)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
        detail = (r.json().get("detail") or "").lower()
        assert "unsupported" in detail or "file type" in detail

    def test_upload_rejects_oversize(self, auth_headers):
        # 11 MB buffer with .png extension (size check happens after read)
        big = b"\x00" * (11 * 1024 * 1024)
        files = {"file": ("big.png", big, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text[:200]}"
        detail = (r.json().get("detail") or "").lower()
        assert "too large" in detail or "max" in detail

    @pytest.mark.parametrize("ext,mime", [
        (".jpg", "image/jpeg"),
        (".jpeg", "image/jpeg"),
        (".png", "image/png"),
        (".webp", "image/webp"),
        (".gif", "image/gif"),
        (".avif", "image/avif"),
    ])
    def test_upload_allowed_extensions(self, auth_headers, ext, mime):
        # Use png bytes; backend validates extension only, not magic bytes
        files = {"file": (f"a{ext}", _png_bytes(), mime)}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=20)
        assert r.status_code == 200, f"{ext} upload failed: {r.status_code} {r.text}"
        assert r.json()["filename"].endswith(ext)
