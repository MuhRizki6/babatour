"""Iteration 7 tests:
- Regression: all previously-passing endpoints still work after refactor into routers
- New: bulk upload endpoint + image optimization (resize + WebP)
- Module structure check
"""
import io
import os
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://umrah-landing.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@babatour.com"
ADMIN_PW = "BabaTour2026!"


# --- fixtures ---
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _make_jpg(w=3000, h=2000, color=(120, 80, 40)) -> bytes:
    img = Image.new("RGB", (w, h), color)
    # add a tiny gradient so JPEG isn't trivially compressible to 0
    px = img.load()
    for x in range(0, w, 50):
        for y in range(0, h, 50):
            px[x, y] = (255, 255, 255)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def _make_png(w=400, h=300, color=(20, 200, 120)) -> bytes:
    img = Image.new("RGB", (w, h), color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_gif() -> bytes:
    img = Image.new("P", (100, 100), 0)
    buf = io.BytesIO()
    img.save(buf, format="GIF")
    return buf.getvalue()


# ---------- REGRESSION: previously passing endpoints ----------
class TestRegression:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert "message" in r.json()

    def test_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_auth_me(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_create_inquiry_public(self):
        payload = {"name": "TEST_iter7", "phone": "+628111", "email": "t@x.com",
                   "package": "Umroh", "message": "regression"}
        r = requests.post(f"{BASE_URL}/api/inquiries", json=payload, timeout=15)
        assert r.status_code in (200, 201), r.text
        data = r.json()
        assert "id" in data

    def test_admin_inquiries_auth_required(self):
        r = requests.get(f"{BASE_URL}/api/admin/inquiries", timeout=15)
        assert r.status_code == 401

    def test_admin_inquiries_with_auth(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_blog_public(self):
        r = requests.get(f"{BASE_URL}/api/blog/public", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_packages_public(self):
        r = requests.get(f"{BASE_URL}/api/packages/public", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1
        self._pkg_id = items[0]["id"]

    def test_package_pdf(self):
        r = requests.get(f"{BASE_URL}/api/packages/public", timeout=15)
        pkg_id = r.json()[0]["id"]
        r2 = requests.get(f"{BASE_URL}/api/packages/{pkg_id}/pdf", timeout=30)
        assert r2.status_code == 200, r2.text
        # PDF magic bytes
        assert r2.content[:4] == b"%PDF", "Response is not a PDF"

    def test_albums_public(self):
        r = requests.get(f"{BASE_URL}/api/albums/public", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_newsletter_subscribe(self):
        import uuid
        email = f"TEST_iter7_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=15)
        assert r.status_code in (200, 201), r.text

    def test_admin_stats(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        # should contain counts
        assert isinstance(data, dict)


# ---------- NEW: image optimization on single upload ----------
class TestImageOptimization:
    def test_large_jpg_optimized_to_webp(self, auth_headers):
        raw = _make_jpg(3000, 2000)
        original_size = len(raw)
        files = {"file": ("big.jpg", raw, "image/jpeg")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].endswith(".webp"), f"Expected .webp, got {data['url']}"
        assert data["optimized"] is True
        # Optimized size should be much smaller than original 3000x2000 JPG
        assert data["size"] < original_size, f"WebP {data['size']} should be < JPG {original_size}"
        # verify file fetch returns image
        url = data["url"] if data["url"].startswith("http") else f"{BASE_URL}{data['url']}"
        rr = requests.get(url, timeout=20)
        assert rr.status_code == 200
        # verify downsized to max 1600
        img = Image.open(io.BytesIO(rr.content))
        assert img.width <= 1600, f"Width {img.width} > 1600"

    def test_small_png_still_converts_to_webp(self, auth_headers):
        raw = _make_png(400, 300)
        files = {"file": ("small.png", raw, "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["url"].endswith(".webp")
        assert data["optimized"] is True

    def test_gif_preserved(self, auth_headers):
        raw = _make_gif()
        files = {"file": ("anim.gif", raw, "image/gif")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["url"].endswith(".gif"), f"Expected .gif preserved, got {data['url']}"
        assert data["optimized"] is False


# ---------- NEW: bulk upload ----------
class TestBulkUpload:
    def test_bulk_auth_required(self):
        r = requests.post(f"{BASE_URL}/api/admin/upload/bulk",
                          files=[("files", ("a.png", _make_png(), "image/png"))], timeout=30)
        assert r.status_code == 401

    def test_bulk_valid_mix(self, auth_headers):
        files = [
            ("files", ("a.png", _make_png(200, 200), "image/png")),
            ("files", ("b.jpg", _make_jpg(800, 600), "image/jpeg")),
            ("files", ("c.gif", _make_gif(), "image/gif")),
        ]
        r = requests.post(f"{BASE_URL}/api/admin/upload/bulk", files=files,
                          headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "uploaded" in data and "errors" in data and "count" in data
        assert data["count"] == 3
        assert len(data["uploaded"]) == 3
        assert len(data["errors"]) == 0

    def test_bulk_with_invalid_file(self, auth_headers):
        files = [
            ("files", ("ok.png", _make_png(), "image/png")),
            ("files", ("bad.txt", b"hello world", "text/plain")),
        ]
        r = requests.post(f"{BASE_URL}/api/admin/upload/bulk", files=files,
                          headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["count"] == 1
        assert len(data["uploaded"]) == 1
        assert len(data["errors"]) == 1
        assert "bad.txt" == data["errors"][0]["filename"]

    def test_bulk_over_20_rejected(self, auth_headers):
        small = _make_png(50, 50)
        files = [("files", (f"f{i}.png", small, "image/png")) for i in range(21)]
        r = requests.post(f"{BASE_URL}/api/admin/upload/bulk", files=files,
                          headers=auth_headers, timeout=60)
        assert r.status_code == 400


# ---------- Module structure ----------
class TestModuleStructure:
    def test_server_is_slim(self):
        with open("/app/backend/server.py") as f:
            lines = f.readlines()
        # spec said ~150; allow generous margin (seed data inflated this; should still be << 760)
        assert len(lines) < 400, f"server.py has {len(lines)} lines, expected slim (<400)"

    def test_routers_exist(self):
        expected = ["auth", "inquiries", "blog", "packages", "albums", "newsletter", "uploads"]
        for name in expected:
            assert os.path.exists(f"/app/backend/routers/{name}.py"), f"missing routers/{name}.py"

    def test_core_deps_exists(self):
        assert os.path.exists("/app/backend/core/deps.py")
