"""
Analysis Router — Main endpoint for profile analysis and job matching.
POST /api/analyze: Takes user profile text, returns matched jobs with insights.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import (
    ProfileInput, AnalysisResponse, JobResult,
    SkillAnalysis, CareerInsight, LearningPath
)
from app.models.db_models import AnalysisHistory
from app.services.adzuna_service import fetch_jobs_multi_category
from app.services.matching_service import match_profile_to_jobs
from app.services.skill_service import (
    extract_skills, determine_top_categories,
    generate_career_insights, generate_learning_paths
)
from app.database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_profile(
    profile: ProfileInput,
    db: Session = Depends(get_db)
):
    """
    Analyze a user's profile and return semantically matched jobs.
    
    Pipeline:
    1. Extract skills from profile text
    2. Determine top job categories
    3. Fetch relevant jobs from Adzuna API
    4. Perform semantic matching with embeddings
    5. Generate career insights and learning paths
    6. Store analysis in data warehouse
    """
    try:
        # Step 1: Extract skills
        skills = extract_skills(profile.text)
        logger.info(f"Extracted {len(skills.technical_skills)} technical skills")
        
        # Step 2: Determine categories
        top_categories = determine_top_categories(skills)
        if not top_categories:
            top_categories = ["Data Science", "Software Engineering"]
        
        # Step 3: Fetch jobs from Adzuna (or demo data)
        raw_jobs = await fetch_jobs_multi_category(
            categories=top_categories,
            results_per_category=8
        )
        logger.info(f"Fetched {len(raw_jobs)} jobs across {len(top_categories)} categories")
        
        # Step 4: Semantic matching
        matched_jobs = match_profile_to_jobs(profile.text, raw_jobs)
        
        # Step 5: Generate insights
        avg_match = (
            sum(j.match_percentage for j in matched_jobs) / len(matched_jobs)
            if matched_jobs else 0
        )
        
        career_insights = generate_career_insights(skills, top_categories, avg_match)
        learning_paths = generate_learning_paths(skills, top_categories)
        
        # Step 6: Store analysis in data warehouse
        try:
            history = AnalysisHistory(
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
            jobs=matched_jobs[:20],  # Top 20 matches
            skills=skills,
            career_insights=career_insights,
            learning_paths=learning_paths,
            top_categories=top_categories,
            avg_match_score=round(avg_match, 1),
            total_jobs_analyzed=len(raw_jobs),
        )
    
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
