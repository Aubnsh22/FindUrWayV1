from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.models.schemas import (
    ProfileInput, AnalysisResponse, JobResult,
    SkillAnalysis, CareerInsight, LearningPath, MarketInsight,
    SectorTrend, HiringHotspot,
)
from app.models.db_models import AnalysisHistory, JobListing, User
from app.services.job_source_manager import JobSourceManager
from app.services.matching_service import match_profile_to_jobs
from app.services.skill_service import (
    extract_skills, determine_top_categories,
    generate_career_insights, generate_learning_paths,
    get_morocco_market_intel,
)
from app.routers.auth import get_optional_user
from app.database import get_db
import logging
import tempfile
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_profile(
    profile: ProfileInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    try:
        skills = extract_skills(profile.text)
        logger.info(f"Extracted {len(skills.technical_skills)} technical skills")

        top_categories = determine_top_categories(skills)
        if not top_categories:
            top_categories = ["Data Science", "Software Engineering"]

        manager = JobSourceManager()
        raw_jobs = await manager.fetch_all_categories(
            categories=top_categories,
            results_per_category=8
        )
        logger.info(f"Fetched {len(raw_jobs)} jobs across {len(top_categories)} categories")

        # Query local cached jobs from database to include Casablanca / Morocco jobs
        db_jobs = db.query(JobListing).filter(JobListing.category.in_(top_categories)).all()
        raw_db_jobs = []
        for j in db_jobs:
            raw_db_jobs.append({
                "job_id": j.job_id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "description": j.description,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "category": j.category,
                "url": j.url,
            })
        logger.info(f"Retrieved {len(raw_db_jobs)} jobs from database warehouse")

        # Merge local DB jobs and live API jobs (prioritizing local DB Moroccan jobs)
        seen_job_ids = set()
        merged_jobs = []
        for j in raw_db_jobs:
            if j.get("job_id") not in seen_job_ids:
                seen_job_ids.add(j.get("job_id"))
                merged_jobs.append(j)
        for j in raw_jobs:
            if j.get("job_id") not in seen_job_ids:
                seen_job_ids.add(j.get("job_id"))
                merged_jobs.append(j)

        matched_jobs = match_profile_to_jobs(
            profile.text, merged_jobs,
            preferred_city=profile.preferred_city,
            min_match_score=profile.min_match_score,
            preferred_categories=profile.preferred_categories,
        )

        avg_match = (
            sum(j.match_percentage for j in matched_jobs) / len(matched_jobs)
            if matched_jobs else 0
        )

        career_insights = generate_career_insights(skills, top_categories, avg_match)
        learning_paths = generate_learning_paths(skills, top_categories)
        market_intel_data = get_morocco_market_intel()
        market_intel = MarketInsight(
            trending_sectors=[SectorTrend(**s) for s in market_intel_data["trending_sectors"]],
            most_demanded_skills=market_intel_data["most_demanded_skills"],
            hiring_hotspots=[HiringHotspot(**h) for h in market_intel_data["hiring_hotspots"]],
            salary_range_mad=market_intel_data["salary_range_mad"],
            market_summary=market_intel_data["market_summary"],
        )

        try:
            history = AnalysisHistory(
                user_id=current_user.id if current_user else None,
                profile_text=profile.text[:1000],
                extracted_skills=[
                    s for s in skills.technical_skills + skills.frameworks
                ],
                top_categories=top_categories,
                avg_match_score=round(avg_match, 2),
                jobs_matched=len(matched_jobs),
            )
            db.add(history)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to store analysis history: {e}")
            db.rollback()

        return AnalysisResponse(
            jobs=matched_jobs[:20],
            skills=skills,
            career_insights=career_insights,
            learning_paths=learning_paths,
            top_categories=top_categories,
            avg_match_score=round(avg_match, 1),
            total_jobs_analyzed=len(raw_jobs),
            market_intel=market_intel,
        )

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/market/insights", response_model=MarketInsight)
async def get_market_insights():
    """Return Morocco tech market intelligence data."""
    data = get_morocco_market_intel()
    return MarketInsight(
        trending_sectors=[SectorTrend(**s) for s in data["trending_sectors"]],
        most_demanded_skills=data["most_demanded_skills"],
        hiring_hotspots=[HiringHotspot(**h) for h in data["hiring_hotspots"]],
        salary_range_mad=data["salary_range_mad"],
        market_summary=data["market_summary"],
    )


@router.post("/analyze/cv", response_model=AnalysisResponse)
async def analyze_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CV/resume file and automatically extract skills + match to jobs.
    Supported formats: PDF, DOCX, TXT, PNG, JPG
    """
    try:
        text = await _extract_text_from_file(file)
        if not text or len(text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Could not extract enough text from CV")

        profile = ProfileInput(text=text)
        return await analyze_profile(profile, db)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CV analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"CV analysis failed: {str(e)}")


async def _extract_text_from_file(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower()

    if ext == ".txt":
        content = await file.read()
        return content.decode("utf-8", errors="ignore")

    if ext in (".png", ".jpg", ".jpeg"):
        try:
            import pytesseract
            from PIL import Image
            import io
            content = await file.read()
            img = Image.open(io.BytesIO(content))
            return pytesseract.image_to_string(img)
        except ImportError:
            logger.warning("pytesseract not installed, trying paddleocr fallback")
            return _ocr_with_paddle(file)

    if ext == ".pdf":
        try:
            import PyPDF2
            content = await file.read()
            import io
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            if text.strip():
                return text
        except ImportError:
            logger.warning("PyPDF2 not installed")

        try:
            content = await file.read()
            return _ocr_with_paddle_pdf(content)
        except Exception as e:
            logger.warning(f"PDF OCR failed: {e}")

    raise HTTPException(
        status_code=400,
        detail=f"Unsupported file format: {ext}. Supported: .txt, .pdf, .png, .jpg, .jpeg"
    )


def _ocr_with_paddle(file: UploadFile) -> str:
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name
        result = ocr.ocr(tmp_path, cls=True)
        os.unlink(tmp_path)
        texts = []
        for line_group in result:
            for line in line_group:
                texts.append(line[1][0])
        return " ".join(texts)
    except Exception as e:
        logger.error(f"PaddleOCR failed: {e}")
        return ""


def _ocr_with_paddle_pdf(content: bytes) -> str:
    try:
        import fitz
        import io
        doc = fitz.open(stream=io.BytesIO(content), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        if text.strip():
            return text
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        texts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap()
            img_bytes = pix.tobytes("png")
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(img_bytes)
                tmp_path = tmp.name
            result = ocr.ocr(tmp_path, cls=True)
            os.unlink(tmp_path)
            for line_group in result:
                for line in line_group:
                    texts.append(line[1][0])
        return " ".join(texts)
    except Exception as e:
        logger.error(f"PaddleOCR PDF failed: {e}")
        return ""
