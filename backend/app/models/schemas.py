"""
Pydantic schemas for request/response validation.
Defines the data contracts between frontend and backend.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ─── Request Schemas ───────────────────────────────────────────

class ProfileInput(BaseModel):
    """User profile description for analysis."""
    text: str = Field(
        ...,
        min_length=20,
        max_length=5000,
        description="User's profile description including skills, projects, experience"
    )


class SaveJobRequest(BaseModel):
    """Request to save a job."""
    job_id: str
    title: str
    company: str = "Unknown"
    location: str = "Morocco"
    description: str = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    category: str = ""
    url: str = ""
    match_percentage: float = 0.0
    matched_skills: List[str] = []
    missing_skills: List[str] = []


# ─── Response Schemas ──────────────────────────────────────────

class JobResult(BaseModel):
    """A single job result with match scoring."""
    job_id: str
    title: str
    company: str
    location: str
    description: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    category: str = ""
    url: str = ""
    match_percentage: float = Field(..., ge=0, le=100)
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    created: Optional[str] = None


class SkillAnalysis(BaseModel):
    """Extracted skills breakdown."""
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    tools: List[str] = []
    languages: List[str] = []
    frameworks: List[str] = []


class CareerInsight(BaseModel):
    """AI-generated career insight."""
    title: str
    description: str
    icon: str = "lightbulb"


class LearningPath(BaseModel):
    """Recommended learning path."""
    skill: str
    reason: str
    resources: List[str] = []
    priority: str = "medium"  # low, medium, high


class AnalysisResponse(BaseModel):
    """Complete analysis response sent to frontend."""
    jobs: List[JobResult]
    skills: SkillAnalysis
    career_insights: List[CareerInsight]
    learning_paths: List[LearningPath]
    top_categories: List[str]
    avg_match_score: float
    total_jobs_analyzed: int


class SavedJobResponse(BaseModel):
    """Saved job response."""
    id: int
    job_id: str
    title: str
    company: str
    location: str
    description: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    category: str
    url: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TrendingSkill(BaseModel):
    """Trending skill data."""
    name: str
    count: int
    growth: float = 0.0  # percentage growth
    category: str = ""


class JobCategory(BaseModel):
    """Job category with count."""
    name: str
    count: int
    tag: str = ""
