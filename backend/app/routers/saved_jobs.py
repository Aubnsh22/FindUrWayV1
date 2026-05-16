"""
Saved Jobs Router — CRUD operations for bookmarked jobs.
Stores saved jobs in PostgreSQL for persistence.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models.schemas import SaveJobRequest, SavedJobResponse
from app.models.db_models import SavedJob
from app.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/saved-jobs", tags=["Saved Jobs"])


@router.post("/", response_model=SavedJobResponse)
def save_job(job: SaveJobRequest, db: Session = Depends(get_db)):
    """Save a job to the database."""
    # Check if already saved
    existing = db.query(SavedJob).filter(SavedJob.job_id == job.job_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")
    
    saved = SavedJob(
        job_id=job.job_id,
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        category=job.category,
        url=job.url,
        match_percentage=job.match_percentage,
        matched_skills=job.matched_skills,
        missing_skills=job.missing_skills,
    )
    
    db.add(saved)
    db.commit()
    db.refresh(saved)
    
    logger.info(f"Job saved: {job.title} ({job.job_id})")
    return saved


@router.get("/", response_model=List[SavedJobResponse])
def list_saved_jobs(db: Session = Depends(get_db)):
    """Get all saved jobs, most recent first."""
    jobs = db.query(SavedJob).order_by(SavedJob.created_at.desc()).all()
    return jobs


@router.delete("/{job_id}")
def delete_saved_job(job_id: str, db: Session = Depends(get_db)):
    """Remove a saved job by its job_id."""
    job = db.query(SavedJob).filter(SavedJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found")
    
    db.delete(job)
    db.commit()
    
    logger.info(f"Job removed: {job_id}")
    return {"message": "Job removed successfully", "job_id": job_id}


@router.get("/count")
def get_saved_count(db: Session = Depends(get_db)):
    """Get the total number of saved jobs."""
    count = db.query(SavedJob).count()
    return {"count": count}
