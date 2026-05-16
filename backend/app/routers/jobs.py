"""
Jobs Router — Browse, search, and filter job listings.
Provides trending skills and categories endpoints.
"""
from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import TrendingSkill, JobCategory
from app.services.adzuna_service import fetch_jobs_from_adzuna
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("/search")
async def search_jobs(
    query: str = Query("data science", description="Search query"),
    location: str = Query("", description="Location filter"),
    category: str = Query("", description="Category filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(15, ge=1, le=50, description="Results per page"),
):
    """Search for jobs with optional filters."""
    try:
        jobs = await fetch_jobs_from_adzuna(
            query=query,
            location=location,
            category=category,
            page=page,
            results_per_page=limit,
        )
        return {
            "jobs": jobs,
            "total": len(jobs),
            "page": page,
            "query": query,
        }
    except Exception as e:
        logger.error(f"Job search failed: {e}")
        return {"jobs": [], "total": 0, "page": page, "query": query}


@router.get("/trending", response_model=List[TrendingSkill])
async def get_trending_skills():
    """
    Get currently trending skills based on job market analysis.
    Returns the most in-demand skills in Morocco's tech sector.
    """
    # Curated trending skills for Morocco's tech market
    trending = [
        TrendingSkill(name="Python", count=342, growth=15.2, category="Language"),
        TrendingSkill(name="Machine Learning", count=256, growth=28.5, category="AI"),
        TrendingSkill(name="SQL", count=412, growth=5.8, category="Data"),
        TrendingSkill(name="Power BI", count=198, growth=32.1, category="BI"),
        TrendingSkill(name="Docker", count=167, growth=22.4, category="DevOps"),
        TrendingSkill(name="React", count=289, growth=12.7, category="Frontend"),
        TrendingSkill(name="TensorFlow", count=145, growth=18.9, category="AI"),
        TrendingSkill(name="AWS", count=213, growth=25.3, category="Cloud"),
        TrendingSkill(name="Spark", count=134, growth=20.1, category="Big Data"),
        TrendingSkill(name="NLP", count=112, growth=35.7, category="AI"),
        TrendingSkill(name="Tableau", count=156, growth=14.3, category="BI"),
        TrendingSkill(name="Kubernetes", count=98, growth=30.2, category="DevOps"),
    ]
    return trending


@router.get("/categories", response_model=List[JobCategory])
async def get_categories():
    """Get available job categories with listing counts."""
    categories = [
        JobCategory(name="Data Science", count=85, tag="ds"),
        JobCategory(name="AI / Machine Learning", count=62, tag="ai"),
        JobCategory(name="Data Analytics", count=104, tag="analytics"),
        JobCategory(name="Business Intelligence", count=78, tag="bi"),
        JobCategory(name="Software Engineering", count=156, tag="swe"),
        JobCategory(name="Data Engineering", count=54, tag="de"),
    ]
    return categories
