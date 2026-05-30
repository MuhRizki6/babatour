"""
Backend tests for iteration 2: Auth + Admin + Blog CRUD + Package detail support.
Covers all endpoints listed in the review_request features_or_bugs_to_test.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://umrah-landing.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@babatour.com"
ADMIN_PASSWORD = "BabaTour2026!"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Auth ----------
class TestAuth:
    def test_login_valid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("token"), str) and len(d["token"]) > 20
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"]["role"] == "admin"

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"})
        assert r.status_code == 401

    def test_login_unknown_user(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert "password_hash" not in d

    def test_me_without_token(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_invalid_token(self, session):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
        assert r.status_code == 401


# ---------- Admin Inquiries ----------
class TestAdminInquiries:
    def test_list_unauthed(self, session):
        r = requests.get(f"{API}/admin/inquiries")
        assert r.status_code == 401

    def test_list_authed(self, session, auth_headers):
        r = session.get(f"{API}/admin/inquiries", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_public_create_then_admin_update_delete(self, session, auth_headers):
        # Public create
        payload = {
            "name": "TEST_Admin Flow",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "081234567890",
            "package_interest": "Umrah VIP",
            "message": "test message",
        }
        r = session.post(f"{API}/inquiries", json=payload)
        assert r.status_code == 200
        inq = r.json()
        iid = inq["id"]
        assert inq["status"] == "new"

        # Patch status
        for new_status in ["contacted", "converted", "closed", "new"]:
            r = session.patch(f"{API}/admin/inquiries/{iid}", headers=auth_headers, json={"status": new_status})
            assert r.status_code == 200, r.text
            assert r.json()["status"] == new_status

        # Invalid status -> 422
        r = session.patch(f"{API}/admin/inquiries/{iid}", headers=auth_headers, json={"status": "invalid"})
        assert r.status_code == 422

        # Verify via list
        r = session.get(f"{API}/admin/inquiries", headers=auth_headers)
        assert r.status_code == 200
        ids = [i["id"] for i in r.json()]
        assert iid in ids

        # Delete
        r = session.delete(f"{API}/admin/inquiries/{iid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # Re-delete -> 404
        r = session.delete(f"{API}/admin/inquiries/{iid}", headers=auth_headers)
        assert r.status_code == 404

    def test_patch_unauthed(self, session):
        r = requests.patch(f"{API}/admin/inquiries/nope", json={"status": "new"})
        assert r.status_code == 401


# ---------- Admin Blog CRUD ----------
class TestAdminBlog:
    created_id = None
    created_slug = None

    def test_list_unauthed(self):
        r = requests.get(f"{API}/admin/blog")
        assert r.status_code == 401

    def test_create_post(self, session, auth_headers):
        title = f"TEST_Post {uuid.uuid4().hex[:6]}"
        payload = {
            "title": title,
            "excerpt": "A test post",
            "content": "# Hello\n\nThis is a **test** post.",
            "published": True,
        }
        r = session.post(f"{API}/admin/blog", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == title
        assert d["slug"]  # auto-generated
        assert d["published"] is True
        assert "id" in d
        TestAdminBlog.created_id = d["id"]
        TestAdminBlog.created_slug = d["slug"]

    def test_list_all_authed(self, session, auth_headers):
        r = session.get(f"{API}/admin/blog", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(p["id"] == TestAdminBlog.created_id for p in items)

    def test_update_post_toggle_draft(self, session, auth_headers):
        pid = TestAdminBlog.created_id
        assert pid
        payload = {
            "title": "TEST_Updated Title",
            "excerpt": "Updated",
            "content": "Updated body",
            "published": False,
        }
        r = session.patch(f"{API}/admin/blog/{pid}", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["title"] == "TEST_Updated Title"
        assert d["published"] is False

    def test_public_excludes_drafts(self, session):
        # post is currently published=False
        r = session.get(f"{API}/blog/public")
        assert r.status_code == 200
        items = r.json()
        assert all(p.get("published", True) for p in items)
        assert not any(p["id"] == TestAdminBlog.created_id for p in items)

    def test_public_detail_draft_404(self, session):
        slug = TestAdminBlog.created_slug
        r = session.get(f"{API}/blog/public/{slug}")
        assert r.status_code == 404

    def test_republish_then_public_visible(self, session, auth_headers):
        pid = TestAdminBlog.created_id
        slug = TestAdminBlog.created_slug
        r = session.patch(f"{API}/admin/blog/{pid}", headers=auth_headers, json={
            "title": "TEST_Updated Title",
            "excerpt": "Updated",
            "content": "Updated body",
            "published": True,
        })
        assert r.status_code == 200
        r = session.get(f"{API}/blog/public/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_public_list_includes_seeded(self, session):
        r = session.get(f"{API}/blog/public")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # at least our re-published post is there
        assert len(items) >= 1

    def test_delete_post(self, session, auth_headers):
        pid = TestAdminBlog.created_id
        r = session.delete(f"{API}/admin/blog/{pid}", headers=auth_headers)
        assert r.status_code == 200
        # Verify gone
        r = session.get(f"{API}/admin/blog", headers=auth_headers)
        assert not any(p["id"] == pid for p in r.json())


# ---------- Admin Stats ----------
class TestStats:
    def test_stats_unauthed(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_authed(self, session, auth_headers):
        r = session.get(f"{API}/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_inquiries", "new_inquiries", "converted", "blog_posts"):
            assert k in d
            assert isinstance(d[k], int)


# ---------- Public seeded post (umrah-landing) ----------
class TestSeededPost:
    def test_umrah_landing_post_exists(self, session):
        r = session.get(f"{API}/blog/public/umrah-landing")
        # Note: This test is informational — only seeded if main agent created it.
        if r.status_code == 404:
            pytest.skip("Seed post 'umrah-landing' not present")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "umrah-landing"
        assert d.get("published") is True


# ---------- Existing public inquiry endpoint regression ----------
class TestPublicInquiryRegression:
    def test_create_inquiry_still_works(self, session, auth_headers):
        payload = {
            "name": "TEST_Regression",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "0812000",
        }
        r = session.post(f"{API}/inquiries", json=payload)
        assert r.status_code == 200
        iid = r.json()["id"]
        # cleanup
        session.delete(f"{API}/admin/inquiries/{iid}", headers=auth_headers)
