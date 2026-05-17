import os, sys
from datetime import datetime, timedelta
from typing import List, Dict
import logging
import hashlib
import asyncio

from airflow import DAG
from airflow.operators.python import PythonOperator

logger = logging.getLogger(__name__)

DAG_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(DAG_DIR, "..", "..", "backend"))

for p in [PROJECT_ROOT, os.path.join(PROJECT_ROOT, "app")]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Read API credentials from .env file and export them so pydantic-settings picks them up
_env_file = os.path.join(PROJECT_ROOT, ".env")
if os.path.isfile(_env_file):
    for line in open(_env_file):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

# WSL/Linux: always use host.docker.internal for Windows PostgreSQL.
# This MUST happen before imports from app.database (which creates engine eagerly).
if os.name != "nt":
    os.environ["DATABASE_URL"] = "postgresql://postgres@host.docker.internal:5432/findurway"

# Import get_settings early to clear cache before app.database creates engine
from app.config import get_settings
get_settings.cache_clear()

from sqlalchemy.exc import IntegrityError
from app.database import SessionLocal, init_db
from app.models.db_models import JobListing, SkillDemand
from app.services.job_source_manager import JobSourceManager, SEARCH_QUERIES

settings = get_settings()

_source_manager = JobSourceManager()

SKILL_KEYWORDS = {
    "python", "java", "javascript", "sql", "r", "scala", "go", "rust",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "docker", "kubernetes", "aws", "azure", "gcp", "spark", "kafka",
    "react", "node.js", "typescript", "django", "flask", "fastapi",
    "tableau", "power bi", "looker", "airflow", "mlflow",
    "postgresql", "mongodb", "redis", "elasticsearch",
    "git", "ci/cd", "terraform", "jenkins", "linux",
}

def fetch_and_store_all_categories():
    init_db()
    db = SessionLocal()
    total_inserted = 0
    try:
        for category, query in SEARCH_QUERIES.items():
            logger.info(f"Fetching jobs for category: {category} (query: {query})")
            raw_jobs = asyncio.run(_source_manager.fetch_by_category(category, results_per_page=20))
            category_count = 0
            for job in raw_jobs:
                if _store_job(db, job, category):
                    total_inserted += 1
                    category_count += 1
            db.commit()
            logger.info(f"Stored {category_count}/{len(raw_jobs)} jobs for category: {category}")
        _update_skill_demand(db)
        db.commit()
        logger.info(f"Ingestion complete - {total_inserted} total jobs stored")
    except Exception as e:
        db.rollback()
        logger.error(f"Ingestion failed: {e}")
        raise
    finally:
        db.close()

def _store_job(db, job: Dict, category: str) -> bool:
    job_id = job.get("job_id") or hashlib.md5(
        f"{job.get('title', '')}_{job.get('company', '')}".encode()
    ).hexdigest()
    existing = db.query(JobListing).filter(JobListing.job_id == job_id).first()
    if existing:
        return False
    record = JobListing(
        job_id=job_id,
        title=job.get("title", "Untitled")[:500],
        company=job.get("company", "Unknown")[:500],
        location=job.get("location", "")[:500],
        description=job.get("description", "")[:2000],
        salary_min=job.get("salary_min"),
        salary_max=job.get("salary_max"),
        category=category[:255],
        url=job.get("url", "")[:1000],
        source=job.get("source", "adzuna"),
    )
    db.add(record)
    return True

def _update_skill_demand(db):
    db.query(SkillDemand).delete()
    listings = db.query(JobListing).all()
    skill_counts: Dict[str, Dict[str, int]] = {}
    for listing in listings:
        text = f"{listing.title} {listing.description}".lower()
        for skill in SKILL_KEYWORDS:
            if skill in text:
                if skill not in skill_counts:
                    skill_counts[skill] = {"total": 0, "by_category": {}}
                skill_counts[skill]["total"] += 1
                cat = listing.category or "Other"
                skill_counts[skill]["by_category"][cat] = (
                    skill_counts[skill]["by_category"].get(cat, 0) + 1
                )
    for skill_name, counts in skill_counts.items():
        for category, count in counts["by_category"].items():
            record = SkillDemand(
                skill_name=skill_name[:255],
                demand_count=count,
                category=category[:255],
            )
            db.add(record)
    logger.info(f"Skill demand updated - {len(skill_counts)} skills tracked")

with DAG(
    dag_id="findurway_job_ingestion",
    default_args={
        "owner": "airflow",
        "depends_on_past": False,
        "start_date": datetime(2024, 1, 1),
        "email_on_failure": False,
        "email_on_retry": False,
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    description="Fetch jobs from Adzuna API + France Travail and populate data warehouse",
    schedule=timedelta(days=1),
    catchup=False,
    tags=["findurway", "adzuna", "ingestion"],
) as dag:
    fetch_and_store_task = PythonOperator(
        task_id="fetch_and_store_all_categories",
        python_callable=fetch_and_store_all_categories,
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fetch_and_store_all_categories()
