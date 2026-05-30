import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://umrah-landing.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Root endpoint
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0


# Create inquiry happy path
def test_create_inquiry_success(client):
    tag = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {
        "name": f"TEST_{tag}",
        "email": f"test_{tag}@example.com",
        "phone": "+6281234567890",
        "package_interest": "umrah-vip",
        "message": "Looking forward to umrah package details.",
    }
    r = client.post(f"{API}/inquiries", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert "created_at" in data
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["phone"] == payload["phone"]
    assert data["package_interest"] == payload["package_interest"]
    assert data["message"] == payload["message"]


# Persistence check via GET
def test_create_then_list_inquiries(client):
    tag = uuid.uuid4().hex[:8]
    payload = {
        "name": f"TEST_persist_{tag}",
        "email": f"persist_{tag}@example.com",
        "phone": "+628111222333",
        "package_interest": "haji-khusus",
        "message": "persist check",
    }
    cr = client.post(f"{API}/inquiries", json=payload)
    assert cr.status_code == 200
    created = cr.json()

    lr = client.get(f"{API}/inquiries")
    assert lr.status_code == 200
    items = lr.json()
    assert isinstance(items, list)
    assert any(it.get("id") == created["id"] for it in items), "Created inquiry not found in list"

    # Sorted desc by created_at - first item should be most recent (could be ours)
    if len(items) >= 2:
        assert items[0]["created_at"] >= items[1]["created_at"]


# Invalid email - 422
def test_invalid_email_returns_422(client):
    payload = {
        "name": "TEST_invalid",
        "email": "not-an-email",
        "phone": "+628123456789",
    }
    r = client.post(f"{API}/inquiries", json=payload)
    assert r.status_code == 422


# Missing required fields - 422
def test_missing_required_fields_returns_422(client):
    r = client.post(f"{API}/inquiries", json={"name": "Only Name"})
    assert r.status_code == 422


def test_missing_phone_returns_422(client):
    r = client.post(
        f"{API}/inquiries",
        json={"name": "x", "email": "x@y.com"},
    )
    assert r.status_code == 422


# Empty name should fail (min_length=1)
def test_empty_name_returns_422(client):
    r = client.post(
        f"{API}/inquiries",
        json={"name": "", "email": "a@b.com", "phone": "+628123"},
    )
    assert r.status_code == 422
