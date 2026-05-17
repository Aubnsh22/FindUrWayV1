import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_root_endpoint(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "running"


@pytest.mark.asyncio
async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_analyze_invalid_empty(client):
    resp = await client.post("/api/analyze", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_analyze_invalid_short(client):
    resp = await client.post("/api/analyze", json={"text": "Hi"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_analyze_valid(client):
    resp = await client.post("/api/analyze", json={
        "text": "I am a data scientist with experience in Python, SQL, and machine learning."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert "skills" in data


@pytest.mark.asyncio
async def test_jobs_search(client):
    resp = await client.get("/api/jobs/search?query=data+scientist&limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data


@pytest.mark.asyncio
async def test_jobs_categories(client):
    resp = await client.get("/api/jobs/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0


@pytest.mark.asyncio
async def test_jobs_trending(client):
    resp = await client.get("/api/jobs/trending")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_saved_jobs_crud(client):
    job = {
        "job_id": "test_save_001",
        "title": "Test Job",
        "company": "Test Corp",
        "category": "Data Science",
    }
    resp = await client.post("/api/saved-jobs/", json=job)
    assert resp.status_code == 200

    resp = await client.get("/api/saved-jobs/")
    assert resp.status_code == 200
    jobs = resp.json()
    saved_ids = [j.get("job_id") for j in jobs]
    assert "test_save_001" in saved_ids

    resp = await client.delete("/api/saved-jobs/test_save_001")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_saved_jobs_count(client):
    resp = await client.get("/api/saved-jobs/count")
    assert resp.status_code == 200
    data = resp.json()
    assert "count" in data
