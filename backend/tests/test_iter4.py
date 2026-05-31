"""Iteration 4 — Packages (Mongo + CRUD), WeasyPrint PDF, Newsletter, Stats."""
import os
import uuid
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://umrah-landing.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"
ADMIN_EMAIL = "admin@babatour.com"
ADMIN_PASSWORD = "BabaTour2026!"

SEEDED_IDS = {"umrah-economy", "umrah-vip", "umrah-plus", "haji-khusus"}


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Public packages ----------
class TestPublicPackages:
    def test_list_public_packages(self):
        r = requests.get(f"{API}/packages/public", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = {p["id"] for p in data}
        assert SEEDED_IDS.issubset(ids), f"missing seeded ids: got {ids}"
        # All published only
        for p in data:
            assert p.get("published") is True
        # Sorted by order ascending
        orders = [p.get("order", 99) for p in data]
        assert orders == sorted(orders), f"not sorted by order: {orders}"

    @pytest.mark.parametrize("pid", sorted(SEEDED_IDS))
    def test_get_single_public_package(self, pid):
        r = requests.get(f"{API}/packages/public/{pid}", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == pid
        assert d.get("name")
        assert d.get("fullTitle")

    def test_unknown_public_package_404(self):
        r = requests.get(f"{API}/packages/public/does-not-exist", timeout=30)
        assert r.status_code == 404


# ---------- Admin packages ----------
class TestAdminPackages:
    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/packages", timeout=30)
        assert r.status_code == 401

    def test_admin_list_with_auth(self, auth):
        r = requests.get(f"{API}/admin/packages", headers=auth, timeout=30)
        assert r.status_code == 200
        data = r.json()
        ids = {p["id"] for p in data}
        assert SEEDED_IDS.issubset(ids)

    def test_admin_get_single(self, auth):
        r = requests.get(f"{API}/admin/packages/umrah-vip", headers=auth, timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == "umrah-vip"

    def test_admin_get_unknown_404(self, auth):
        r = requests.get(f"{API}/admin/packages/nope-{uuid.uuid4().hex[:6]}", headers=auth, timeout=30)
        assert r.status_code == 404

    def test_full_crud_lifecycle(self, auth):
        # CREATE
        unique = f"TEST_pkg_{uuid.uuid4().hex[:6]}"
        payload = {
            "name": unique,
            "fullTitle": f"Full Title {unique}",
            "priceFrom": "Rp 30 jt",
            "published": False,
            "itinerary": [{"day": 1, "title": "Arrival", "items": ["check-in"]}],
            "order": 50,
        }
        r = requests.post(f"{API}/admin/packages", headers=auth, json=payload, timeout=30)
        assert r.status_code == 200, r.text
        created = r.json()
        pid = created["id"]
        assert pid  # slug auto-generated
        assert created["name"] == unique
        assert created["published"] is False
        assert created["priceFrom"] == "Rp 30 jt"

        # GET verifies persistence
        g = requests.get(f"{API}/admin/packages/{pid}", headers=auth, timeout=30)
        assert g.status_code == 200
        assert g.json()["fullTitle"] == payload["fullTitle"]

        # Unpublished must NOT appear in public list
        pub = requests.get(f"{API}/packages/public/{pid}", timeout=30)
        assert pub.status_code == 404

        # PATCH
        upd = {**payload, "priceFrom": "Rp 35 jt", "published": True,
               "itinerary": [
                   {"day": 1, "title": "Arrival", "items": ["check-in"]},
                   {"day": 2, "title": "City Tour", "items": ["mosque"]},
               ]}
        r2 = requests.patch(f"{API}/admin/packages/{pid}", headers=auth, json=upd, timeout=30)
        assert r2.status_code == 200, r2.text
        updated = r2.json()
        assert updated["priceFrom"] == "Rp 35 jt"
        assert updated["published"] is True
        assert len(updated["itinerary"]) == 2

        # Now visible publicly
        pub2 = requests.get(f"{API}/packages/public/{pid}", timeout=30)
        assert pub2.status_code == 200

        # DELETE
        d = requests.delete(f"{API}/admin/packages/{pid}", headers=auth, timeout=30)
        assert d.status_code == 200
        g2 = requests.get(f"{API}/admin/packages/{pid}", headers=auth, timeout=30)
        assert g2.status_code == 404


# ---------- PDF ----------
class TestPdf:
    @pytest.mark.parametrize("pid", sorted(SEEDED_IDS))
    def test_pdf_returns_pdf(self, pid):
        r = requests.get(f"{API}/packages/{pid}/pdf", timeout=90)
        assert r.status_code == 200, r.text[:300]
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF", f"not a PDF: {r.content[:20]!r}"
        assert len(r.content) > 5_000, f"PDF too small: {len(r.content)} bytes"

    def test_umrah_vip_pdf_size(self):
        r = requests.get(f"{API}/packages/umrah-vip/pdf", timeout=90)
        assert r.status_code == 200
        # spec says ~36KB+. Allow some tolerance.
        assert len(r.content) > 20_000, f"umrah-vip PDF only {len(r.content)} bytes"

    def test_unknown_pdf_404(self):
        r = requests.get(f"{API}/packages/does-not-exist/pdf", timeout=30)
        assert r.status_code == 404


# ---------- Newsletter ----------
class TestNewsletter:
    @pytest.fixture(scope="class")
    def created_email(self):
        return f"test_{uuid.uuid4().hex[:8]}@example.com"

    def test_subscribe(self, created_email):
        r = requests.post(f"{API}/newsletter", json={"email": created_email, "name": "Tester"}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["alreadySubscribed"] is False

    def test_subscribe_duplicate_idempotent(self, created_email):
        r = requests.post(f"{API}/newsletter", json={"email": created_email, "name": "Tester"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["alreadySubscribed"] is True

    def test_invalid_email_422(self):
        r = requests.post(f"{API}/newsletter", json={"email": "not-an-email"}, timeout=30)
        assert r.status_code == 422

    def test_admin_list_subscribers(self, auth, created_email):
        r = requests.get(f"{API}/admin/newsletter", headers=auth, timeout=30)
        assert r.status_code == 200
        emails = [s["email"] for s in r.json()]
        assert created_email in emails

    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/newsletter", timeout=30)
        assert r.status_code == 401

    def test_admin_export_csv(self, auth, created_email):
        r = requests.get(f"{API}/admin/newsletter/export", headers=auth, timeout=30)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("text/csv")
        body = r.text
        assert body.splitlines()[0] == "email,name,created_at"
        assert created_email in body

    def test_admin_delete_subscriber(self, auth, created_email):
        # find id
        r = requests.get(f"{API}/admin/newsletter", headers=auth, timeout=30)
        sid = next((s["id"] for s in r.json() if s["email"] == created_email), None)
        assert sid, "subscriber not found"
        d = requests.delete(f"{API}/admin/newsletter/{sid}", headers=auth, timeout=30)
        assert d.status_code == 200
        r2 = requests.get(f"{API}/admin/newsletter", headers=auth, timeout=30)
        emails = [s["email"] for s in r2.json()]
        assert created_email not in emails


# ---------- Stats ----------
class TestStats:
    def test_stats_includes_new_fields(self, auth):
        r = requests.get(f"{API}/admin/stats", headers=auth, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "packages" in d
        assert "subscribers" in d
        assert d["packages"] >= 4
        assert isinstance(d["subscribers"], int)
