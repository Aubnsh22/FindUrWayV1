from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.models.schemas import SaveJobRequest, SavedJobResponse
from app.models.db_models import SavedJob, User
from app.routers.auth import get_optional_user
from app.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/saved-jobs", tags=["Saved Jobs"])


def _user_filter(current_user: Optional[User]):
    if current_user:
        return SavedJob.user_id == current_user.id
    return SavedJob.user_id.is_(None)


@router.post("/", response_model=SavedJobResponse)
def save_job(
    job: SaveJobRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    existing = db.query(SavedJob).filter(
        SavedJob.job_id == job.job_id,
        _user_filter(current_user),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")

    saved = SavedJob(
        user_id=current_user.id if current_user else None,
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
    return saved


@router.get("/", response_model=List[SavedJobResponse])
def list_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    jobs = (
        db.query(SavedJob)
        .filter(_user_filter(current_user))
        .order_by(SavedJob.created_at.desc())
        .all()
    )
    return jobs


@router.delete("/{job_id}")
def delete_saved_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    job = db.query(SavedJob).filter(
        SavedJob.job_id == job_id,
        _user_filter(current_user),
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Saved job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job removed successfully", "job_id": job_id}


@router.get("/count")
def get_saved_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    count = db.query(SavedJob).filter(_user_filter(current_user)).count()
    return {"count": count}
