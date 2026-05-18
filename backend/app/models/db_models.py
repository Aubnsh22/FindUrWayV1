"""
SQLAlchemy ORM models for the FindUrWay database.
Stores saved jobs, user profiles, and analysis history.
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class SavedJob(Base):
    """Model for jobs saved by users."""
    __tablename__ = "saved_jobs"
    __table_args__ = (
        # Allow unique job per user, or unique job for anonymous (NULL user_id)
        # PostgreSQL treats each NULL as distinct for unique constraints
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    job_id = Column(String(255), nullable=False)
    title = Column(String(500), nullable=False)
    company = Column(String(500), default="Unknown")
    location = Column(String(500), default="Morocco")
    description = Column(Text, default="")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    category = Column(String(255), default="")
    url = Column(String(1000), default="")
    match_percentage = Column(Float, default=0.0)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AnalysisHistory(Base):
    """Model for storing analysis results in the data warehouse."""
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    profile_name = Column(String(255), default="")
    profile_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    top_categories = Column(JSON, default=list)
    avg_match_score = Column(Float, default=0.0)
    jobs_matched = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class JobListing(Base):
    """Data warehouse table: stores fetched job listings for analytics."""
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(String(255), unique=True, index=True)
    title = Column(String(500), nullable=False)
    company = Column(String(500), default="Unknown")
    location = Column(String(500), default="")
    description = Column(Text, default="")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    category = Column(String(255), default="")
    url = Column(String(1000), default="")
    source = Column(String(100), default="adzuna")
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    """Model for registered users (login/signup)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SkillDemand(Base):
    """Data warehouse table: tracks skill demand over time."""
    __tablename__ = "skill_demand"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_name = Column(String(255), nullable=False, index=True)
    demand_count = Column(Integer, default=0)
    category = Column(String(255), default="")
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
