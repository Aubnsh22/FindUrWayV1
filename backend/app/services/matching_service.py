"""
Matching Service — Orchestrates the profile-to-job semantic matching pipeline.
Combines NLP embeddings with skill analysis for comprehensive job recommendations.
"""
import numpy as np
from typing import List, Dict, Tuple
from app.services import nlp_service
from app.services.skill_service import extract_skills, identify_missing_skills
from app.models.schemas import JobResult
import logging

logger = logging.getLogger(__name__)


def match_profile_to_jobs(
    profile_text: str,
    jobs: List[Dict],
) -> List[JobResult]:
    """
    Core matching pipeline:
    1. Generate embedding for user profile
    2. Generate embeddings for each job (title + description)
    3. Compute cosine similarity scores
    4. Extract matched and missing skills
    5. Return ranked results with match percentages
    """
    if not jobs:
        return []
    
    # Step 1: Extract user skills for later comparison
    user_skills = extract_skills(profile_text)
    all_user_skills = (
        user_skills.technical_skills +
        user_skills.frameworks +
        user_skills.languages
    )
    
    # Step 2: Generate profile embedding
    profile_embedding = nlp_service.generate_embedding(profile_text)
    
    if profile_embedding is None:
        # Fallback: keyword-based matching if NLP model isn't loaded
        logger.warning("NLP model not available, using keyword matching fallback")
        return _keyword_match_fallback(profile_text, all_user_skills, jobs)
    
    # Step 3: Generate job embeddings in batch
    job_texts = [
        f"{job.get('title', '')} {job.get('description', '')}"
        for job in jobs
    ]
    job_embeddings = nlp_service.generate_embeddings_batch(job_texts)
    
    if job_embeddings is None:
        return _keyword_match_fallback(profile_text, all_user_skills, jobs)
    
    # Step 4: Compute cosine similarities
    similarities = nlp_service.compute_similarity_batch(
        profile_embedding, job_embeddings
    )
    
    # Step 5: Build ranked results
    results = []
    for i, (job, sim_score) in enumerate(zip(jobs, similarities)):
        # Convert similarity (0-1) to percentage (0-100)
        # Apply a scaling factor to make scores more meaningful
        match_pct = _scale_match_percentage(sim_score)
        
        # Find matched and missing skills for this specific job
        job_desc = job.get("description", "")
        matched = _find_matched_skills(all_user_skills, job_desc)
        missing = identify_missing_skills(all_user_skills, job_desc)
        
        results.append(JobResult(
            job_id=job.get("job_id", f"job_{i}"),
            title=job.get("title", "Untitled"),
            company=job.get("company", "Unknown"),
            location=job.get("location", "Morocco"),
            description=job.get("description", "")[:500],
            salary_min=job.get("salary_min"),
            salary_max=job.get("salary_max"),
            category=job.get("category", ""),
            url=job.get("url", ""),
            match_percentage=round(match_pct, 1),
            matched_skills=matched[:10],
            missing_skills=missing[:8],
            created=job.get("created", ""),
        ))
    
    # Sort by match percentage (highest first)
    results.sort(key=lambda x: x.match_percentage, reverse=True)
    
    return results


def _scale_match_percentage(cosine_sim: float) -> float:
    """
    Scale raw cosine similarity to a more intuitive percentage.
    Cosine similarity for text tends to cluster in the 0.1-0.7 range,
    so we scale it to a more user-friendly 0-100 range.
    """
    # Map [0.05, 0.65] → [15, 95]
    scaled = ((cosine_sim - 0.05) / 0.60) * 80 + 15
    return max(10, min(98, scaled))  # Clamp between 10-98%


def _find_matched_skills(
    user_skills: List[str],
    job_description: str
) -> List[str]:
    """Find skills the user has that are mentioned in the job description."""
    job_lower = job_description.lower()
    matched = [
        skill for skill in user_skills
        if skill.lower() in job_lower
    ]
    return list(dict.fromkeys(matched))  # Deduplicate


def _keyword_match_fallback(
    profile_text: str,
    user_skills: List[str],
    jobs: List[Dict]
) -> List[JobResult]:
    """
    Fallback matching using keyword overlap when NLP model is unavailable.
    """
    profile_lower = profile_text.lower()
    user_skill_set = {s.lower() for s in user_skills}
    
    results = []
    for i, job in enumerate(jobs):
        job_desc = job.get("description", "").lower()
        job_title = job.get("title", "").lower()
        job_text = f"{job_title} {job_desc}"
        
        # Count keyword matches
        job_words = set(job_text.split())
        profile_words = set(profile_lower.split())
        
        # Skill-based matching
        matched_skills = [s for s in user_skills if s.lower() in job_text]
        skill_score = len(matched_skills) / max(len(user_skill_set), 1)
        
        # Word overlap
        overlap = len(job_words.intersection(profile_words))
        word_score = min(overlap / 20, 1.0)
        
        # Combined score
        match_pct = (skill_score * 70 + word_score * 30)
        match_pct = max(10, min(95, match_pct))
        
        missing = identify_missing_skills(user_skills, job.get("description", ""))
        
        results.append(JobResult(
            job_id=job.get("job_id", f"job_{i}"),
            title=job.get("title", "Untitled"),
            company=job.get("company", "Unknown"),
            location=job.get("location", "Morocco"),
            description=job.get("description", "")[:500],
            salary_min=job.get("salary_min"),
            salary_max=job.get("salary_max"),
            category=job.get("category", ""),
            url=job.get("url", ""),
            match_percentage=round(match_pct, 1),
            matched_skills=matched_skills[:10],
            missing_skills=missing[:8],
            created=job.get("created", ""),
        ))
    
    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results
