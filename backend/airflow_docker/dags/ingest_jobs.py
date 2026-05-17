"""
FindUrWay — Airflow DAG for Job Ingestion Pipeline

Fetches job listings from Adzuna API across multiple categories,
normalizes them, and stores them in the data warehouse tables:
  - job_listings (raw job records)
  - skill_demand  (aggregated skill demand counts)

Schedule: Daily
"""
from __future__ import annotations
import os
import sys
import hashlib
import logging
from datetime import datetime, timedelta
from typing import List, Dict

AIRFLOW_AVAILABLE = False
try:
    from airflow import DAG
    from airflow.operators.python import PythonOperator
    AIRFLOW_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    pass

_DOCKER_PROJECT_ROOT = "/opt/findurway"
if os.path.isdir(_DOCKER_PROJECT_ROOT):
    PROJECT_ROOT = _DOCKER_PROJECT_ROOT
elif os.path.isdir(os.path.expanduser("~/backend")):
    PROJECT_ROOT = os.path.expanduser("~/backend")
elif os.path.isdir(os.path.join(os.path.dirname(__file__), "..", "..", "backend")):
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
else:
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from sqlalchemy.exc import IntegrityError
from app.config import get_settings
from app.database import SessionLocal, init_db
from app.models.db_models import JobListing, SkillDemand
from app.services.job_source_manager import JobSourceManager, SEARCH_QUERIES

logger = logging.getLogger(__name__)

_DATABASE_URL = os.environ.get("FINDURWAY_DATABASE_URL")
if _DATABASE_URL:
    os.environ["DATABASE_URL"] = _DATABASE_URL

settings = get_settings()

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
            jobs = _fetch_jobs_for_category(category, query)
            category_count = 0
            for job in jobs:
                if _store_job(db, job, category):
                    total_inserted += 1
                    category_count += 1
            db.commit()
            logger.info(f"Stored {category_count}/{len(jobs)} jobs for category: {category}")
        _update_skill_demand(db)
        db.commit()
        logger.info(f"Ingestion complete - {total_inserted} total jobs stored")
    except Exception as e:
        db.rollback()
        logger.error(f"Ingestion failed: {e}")
        raise
    finally:
        db.close()

_source_manager = JobSourceManager()

def _fetch_jobs_for_category(category: str, query: str) -> List[Dict]:
    import asyncio
    raw_jobs = asyncio.run(_source_manager.fetch_by_category(category, results_per_page=20))
    return raw_jobs

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

if AIRFLOW_AVAILABLE:
    default_args = {
        "owner": "airflow",
        "depends_on_past": False,
        "start_date": datetime(2024, 1, 1),
        "email_on_failure": False,
        "email_on_retry": False,
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    }
    dag = DAG(
        dag_id="findurway_job_ingestion",
        default_args=default_args,
        description="Fetch jobs from Adzuna API and populate data warehouse",
        schedule=timedelta(days=1),
        catchup=False,
        tags=["findurway", "adzuna", "ingestion"],
    )
    fetch_and_store_task = PythonOperator(
        task_id="fetch_and_store_all_categories",
        python_callable=fetch_and_store_all_categories,
        dag=dag,
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fetch_and_store_all_categories()
