from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ─── Request Schemas ───────────────────────────────────────────

class ProfileInput(BaseModel):
    text: str = Field(
        ..., min_length=20, max_length=5000,
        description="User's profile description including skills, projects, experience"
    )
    preferred_city: str = Field(
        "", max_length=100,
        description="Preferred city for job search (e.g. Casablanca, Rabat, Marrakech)"
    )
    preferred_categories: List[str] = Field(
        [],
        description="Preferred job categories to prioritize (e.g. AI / Machine Learning, Data Science)"
    )
    min_match_score: float = Field(
        0.0, ge=0.0, le=100.0,
        description="Minimum match percentage threshold (0-100)"
    )


class SaveJobRequest(BaseModel):
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

class MatchExplanation(BaseModel):
    summary: str = ""
    matched_skills_detail: List[str] = []
    missing_skills_detail: List[str] = []
    compatibility: str = ""
    skill_tier_breakdown: Optional[dict] = None


class JobResult(BaseModel):
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
    explanation: Optional[MatchExplanation] = None
    created: Optional[str] = None


class SkillAnalysis(BaseModel):
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    tools: List[str] = []
    languages: List[str] = []
    frameworks: List[str] = []


class CareerInsight(BaseModel):
    title: str
    description: str
    icon: str = "lightbulb"


class LearningPath(BaseModel):
    skill: str
    reason: str
    resources: List[str] = []
    priority: str = "medium"
    impact_score: Optional[float] = None
    impact_label: Optional[str] = None


class AnalysisResponse(BaseModel):
    jobs: List[JobResult]
    skills: SkillAnalysis
    career_insights: List[CareerInsight]
    learning_paths: List[LearningPath]
    top_categories: List[str]
    avg_match_score: float
    total_jobs_analyzed: int
    market_intel: Optional["MarketInsight"] = None


class SavedJobResponse(BaseModel):
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
    name: str
    count: int
    growth: float = 0.0
    category: str = ""


class JobCategory(BaseModel):
    name: str
    count: int
    tag: str = ""


class SectorTrend(BaseModel):
    sector: str
    growth_pct: float
    demand_level: str
    key_skills: List[str] = []


class HiringHotspot(BaseModel):
    city: str
    job_count: int
    avg_salary_mad: Optional[float] = None


class MarketInsight(BaseModel):
    trending_sectors: List[SectorTrend] = []
    most_demanded_skills: List[str] = []
    hiring_hotspots: List[HiringHotspot] = []
    salary_range_mad: Optional[str] = None
    market_summary: str = ""
