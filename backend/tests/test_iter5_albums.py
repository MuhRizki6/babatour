"""Iteration 5 — Albums (Gallery) public & admin CRUD."""
import os
import uuid
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE}/api"
ADMIN_EMAIL = "admin@babatour.com"
ADMIN_PASSWORD = "BabaTour2026!"

SEEDED_SLUGS = ["umroh-vip-maret-2026", "umroh-plus-turki-mei-2026", "haji-khusus-2024"]


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Public albums ----------
class TestPublicAlbums:
    def test_list_returns_seeded_albums_sorted(self):
        r = requests.get(f"{API}/albums/public", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        slugs = [a["slug"] for a in data]
        for s in SEEDED_SLUGS:
            assert s in slugs, f"missing seeded slug {s}; got {slugs}"
        # All published only
        for a in data:
            assert a.get("published") is True
            assert "_id" not in a
        # Sorted by order ascending
        orders = [a.get("order", 99) for a in data]
        assert orders == sorted(orders), f"not sorted by order: {orders}"

    @pytest.mark.parametrize("slug", SEEDED_SLUGS)
    def test_public_single_album(self, slug):
        r = requests.get(f"{API}/albums/public/{slug}", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert isinstance(d.get("images"), list)
        assert len(d["images"]) >= 1
        assert d.get("title")

    def test_public_unknown_slug_404(self):
        r = requests.get(f"{API}/albums/public/unknown-slug-xyz", timeout=30)
        assert r.status_code == 404


# ---------- Admin albums ----------
class TestAdminAlbums:
    def test_admin_list_requires_auth(self):
        r = requests.get(f"{API}/admin/albums", timeout=30)
        assert r.status_code == 401

    def test_admin_list_with_auth(self, auth):
        r = requests.get(f"{API}/admin/albums", headers=auth, timeout=30)
        assert r.status_code == 200
        data = r.json()
        slugs = [a["slug"] for a in data]
        for s in SEEDED_SLUGS:
            assert s in slugs

    def test_admin_get_single(self, auth):
        # Find id of first seeded album
        r = requests.get(f"{API}/admin/albums", headers=auth, timeout=30)
        assert r.status_code == 200
        first = next(a for a in r.json() if a["slug"] == SEEDED_SLUGS[0])
        aid = first["id"]
        r2 = requests.get(f"{API}/admin/albums/{aid}", headers=auth, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["id"] == aid
        assert r2.json()["slug"] == SEEDED_SLUGS[0]

    def test_admin_get_unknown_404(self, auth):
        r = requests.get(f"{API}/admin/albums/nope-{uuid.uuid4().hex[:6]}",
                         headers=auth, timeout=30)
        assert r.status_code == 404

    def test_crud_lifecycle_auto_slug_and_cover_default(self, auth):
        unique_title = f"TEST_Album_{uuid.uuid4().hex[:6]}"
        payload = {
            "title": unique_title,
            "images": ["https://example.com/a.jpg", "https://example.com/b.jpg"],
            "event_date": "2026-04-01",
            "published": False,
            "order": 50,
        }
        # CREATE — slug auto from title, cover defaults to first image
        r = requests.post(f"{API}/admin/albums", headers=auth, json=payload, timeout=30)
        assert r.status_code == 200, r.text
        created = r.json()
        aid = created["id"]
        assert created["slug"]  # auto slug
        assert unique_title.lower().replace("_", "-")[:5] in created["slug"].lower() or \
               created["slug"].startswith("test")
        assert created["cover_image"] == "https://example.com/a.jpg"
        assert created["published"] is False

        # GET persistence check
        g = requests.get(f"{API}/admin/albums/{aid}", headers=auth, timeout=30)
        assert g.status_code == 200
        assert g.json()["title"] == unique_title

        # Unpublished should not appear in public
        pub_slug_r = requests.get(f"{API}/albums/public/{created['slug']}", timeout=30)
        assert pub_slug_r.status_code == 404

        # PATCH — publish + add image
        upd = {**payload,
               "images": ["https://example.com/a.jpg",
                          "https://example.com/b.jpg",
                          "https://example.com/c.jpg"],
               "published": True}
        r2 = requests.patch(f"{API}/admin/albums/{aid}", headers=auth, json=upd, timeout=30)
        assert r2.status_code == 200, r2.text
        upd_doc = r2.json()
        assert upd_doc["published"] is True
        assert len(upd_doc["images"]) == 3

        # Now public visibility
        pub2 = requests.get(f"{API}/albums/public/{upd_doc['slug']}", timeout=30)
        assert pub2.status_code == 200

        # DELETE
        d = requests.delete(f"{API}/admin/albums/{aid}", headers=auth, timeout=30)
        assert d.status_code == 200
        g2 = requests.get(f"{API}/admin/albums/{aid}", headers=auth, timeout=30)
        assert g2.status_code == 404

    def test_slug_uniqueness_suffix(self, auth):
        title = f"TEST_DupTitle_{uuid.uuid4().hex[:6]}"
        payload = {"title": title, "images": ["https://x/y.jpg"], "published": False}
        r1 = requests.post(f"{API}/admin/albums", headers=auth, json=payload, timeout=30)
        assert r1.status_code == 200, r1.text
        a1 = r1.json()
        r2 = requests.post(f"{API}/admin/albums", headers=auth, json=payload, timeout=30)
        assert r2.status_code == 200, r2.text
        a2 = r2.json()
        try:
            assert a1["slug"] != a2["slug"]
            assert a2["slug"].endswith("-2"), f"expected -2 suffix, got {a2['slug']}"
            assert a2["slug"].startswith(a1["slug"])
        finally:
            requests.delete(f"{API}/admin/albums/{a1['id']}", headers=auth, timeout=30)
            requests.delete(f"{API}/admin/albums/{a2['id']}", headers=auth, timeout=30)
