import pytest
from app.database import SessionLocal, init_db
from app.models.db_models import JobListing, SkillDemand


@pytest.fixture(autouse=True)
def clean_db():
    init_db()
    db = SessionLocal()
    db.query(SkillDemand).delete()
    db.query(JobListing).delete()
    db.commit()
    db.close()


def test_create_job_listing():
    db = SessionLocal()
    job = JobListing(
        job_id="test_001",
        title="Data Scientist",
        company="Test Corp",
        location="Paris",
        description="A test job description",
        category="Data Science",
        source="adzuna",
    )
    db.add(job)
    db.commit()
    assert job.id is not None
    assert job.job_id == "test_001"
    db.close()


def test_job_listing_unique_job_id():
    db = SessionLocal()
    db.add(JobListing(job_id="dup_001", title="Job A", company="X", source="adzuna"))
    db.commit()
    db.add(JobListing(job_id="dup_001", title="Job B", company="Y", source="adzuna"))
    with pytest.raises(Exception):
        db.commit()
    db.close()


def test_create_skill_demand():
    db = SessionLocal()
    sk = SkillDemand(
        skill_name="python",
        demand_count=42,
        category="Data Science",
    )
    db.add(sk)
    db.commit()
    assert sk.id is not None
    db.close()


def test_job_listing_foreign_fields():
    db = SessionLocal()
    job = JobListing(
        job_id="test_fields",
        title="Full Stack Developer",
        company="Startup Inc",
        location="Remote",
        description="Full stack role",
        salary_min=50000.0,
        salary_max=80000.0,
        category="Software Engineering",
        url="https://example.com/job",
        source="adzuna",
    )
    db.add(job)
    db.commit()
    fetched = db.query(JobListing).filter_by(job_id="test_fields").first()
    assert fetched.salary_min == 50000.0
    assert fetched.salary_max == 80000.0
    assert fetched.source == "adzuna"
    db.close()
