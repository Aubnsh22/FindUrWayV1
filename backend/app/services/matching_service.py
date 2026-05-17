import logging
import re
from typing import List, Dict, Tuple
from app.models.schemas import JobResult, MatchExplanation
from app.services.nlp_service import (
    get_model, generate_embedding, generate_embeddings_batch,
    compute_similarity_batch
)
from app.services.skill_service import (
    extract_skills, identify_missing_skills, detect_career_role, get_role_boost,
)
from app.services.skill_service import TECHNICAL_SKILLS, FRAMEWORKS_AND_TOOLS, SOFT_SKILLS

logger = logging.getLogger(__name__)

CORE_SKILLS = {
    "python", "sql", "scala", "java", "javascript", "typescript",
    "machine learning", "deep learning", "statistics", "nlp",
    "tensorflow", "pytorch", "spark", "docker", "kubernetes",
    "aws", "azure", "gcp", "airflow", "mlops",
    "data engineering", "data analysis", "data visualization",
    "react", "node.js", "git",
}

SECONDARY_SKILLS = {
    "linux", "ci/cd", "rest api", "graphql",
    "django", "flask", "fastapi",
    "postgresql", "mongodb", "redis", "elasticsearch",
    "tableau", "power bi", "looker",
    "scikit-learn", "pandas", "numpy",
    "express", "next.js", "html", "css", "tailwindcss",
}

ALL_DEFINED_SKILLS = CORE_SKILLS | SECONDARY_SKILLS


def _get_skill_tier(skill: str) -> str:
    s = skill.lower().strip()
    if s in CORE_SKILLS:
        return "core"
    if s in SECONDARY_SKILLS:
        return "secondary"
    return "bonus"


SKILL_TIER_WEIGHTS = {
    "core": 3.0,
    "secondary": 1.5,
    "bonus": 0.8,
}

ROLE_LABELS = {
    "frontend": "Frontend Developer",
    "backend": "Backend Developer",
    "fullstack": "Full Stack Developer",
    "aiml": "AI/ML Engineer",
    "dataengineering": "Data Engineer",
    "devops": "DevOps Engineer",
    "mobile": "Mobile Developer",
    "datascience": "Data Scientist",
}


def match_profile_to_jobs(
    profile_text: str,
    jobs: List[Dict],
) -> List[JobResult]:
    if not jobs:
        return []

    profile_skills = extract_skills(profile_text)
    all_user_skills = list(set(
        s.lower() for s in (
            profile_skills.technical_skills +
            profile_skills.soft_skills +
            profile_skills.tools +
            profile_skills.languages +
            profile_skills.frameworks
        )
    ))

    user_role, secondary_role, role_confidence = detect_career_role(profile_skills)
    logger.info(f"Detected role: {user_role} (confidence: {role_confidence:.2f}), skills: {all_user_skills}")

    model = get_model()
    if model is None:
        logger.warning("NLP model not available, using keyword matching fallback")
        return _keyword_match_fallback(profile_text, all_user_skills, jobs, user_role)

    try:
        profile_emb = generate_embedding(profile_text)
        job_texts = [_build_job_text(job) for job in jobs]
        job_embs = generate_embeddings_batch(job_texts)
        similarities = compute_similarity_batch(profile_emb, job_embs)
    except Exception as e:
        logger.error(f"Embedding failed: {e}, falling back to keyword matching")
        return _keyword_match_fallback(profile_text, all_user_skills, jobs, user_role)

    results = []
    for i, job in enumerate(jobs):
        sim = similarities[i] if i < len(similarities) else 0.0
        scaled = _scale_match_percentage(sim)
        weighted = _compute_weighted_score(all_user_skills, job, scaled, user_role)
        final_pct = max(10, min(98, weighted))

        job_desc = job.get("description", "") + " " + job.get("title", "")
        matched = _find_matched_skills(all_user_skills, job_desc)
        missing = identify_missing_skills(all_user_skills, job_desc)

        explanation = _generate_explanation(
            profile_text, all_user_skills, matched, missing,
            final_pct, sim, job, user_role
        )

        results.append(JobResult(
            job_id=job.get("job_id", f"job_{i}"),
            title=job.get("title", "Untitled"),
            company=job.get("company", "Unknown"),
            location=job.get("location", "Remote"),
            description=job.get("description", ""),
            salary_min=job.get("salary_min"),
            salary_max=job.get("salary_max"),
            category=job.get("category", ""),
            url=job.get("url", ""),
            match_percentage=round(final_pct, 1),
            matched_skills=matched[:8],
            missing_skills=missing[:8],
            explanation=explanation,
            created=job.get("created"),
        ))

    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results


def _build_job_text(job: Dict) -> str:
    parts = [
        job.get("title", ""),
        job.get("description", ""),
        job.get("company", ""),
        job.get("category", ""),
    ]
    return " ".join(p for p in parts if p)


def _compute_weighted_score(
    user_skills: List[str],
    job: Dict,
    base_score: float,
    user_role: str,
) -> float:
    job_text = (job.get("description", "") + " " + job.get("title", "")).lower()
    user_skill_set = {s.lower() for s in user_skills}

    weighted_hits = 0.0
    weighted_total = 0.0

    for skill in ALL_DEFINED_SKILLS:
        if skill in job_text:
            weight = SKILL_TIER_WEIGHTS.get(_get_skill_tier(skill), 0.5)
            weighted_total += weight
            if skill in user_skill_set:
                weighted_hits += weight

    skill_ratio = (weighted_hits / weighted_total) if weighted_total > 0 else 0.0
    score = base_score * 0.6 + (skill_ratio * 100) * 0.4

    role_boost = get_role_boost(user_role, job)
    score *= role_boost

    return max(10, min(98, score))


def _generate_explanation(
    profile_text: str,
    user_skills: List[str],
    matched_skills: List[str],
    missing_skills: List[str],
    match_pct: float,
    raw_similarity: float,
    job: Dict,
    user_role: str = "fullstack",
) -> MatchExplanation:
    title = job.get("title", "this role")
    role_label = ROLE_LABELS.get(user_role, "Tech Professional")

    if matched_skills:
        top = matched_skills[:3]
        summary = f"Your profile reads as a {role_label}. Matched because your {', '.join(top)} align strongly with this role."
    else:
        summary = f"Your profile reads as a {role_label}. Limited direct skill overlap with this position."

    core_matched = [s for s in matched_skills if _get_skill_tier(s) == "core"]
    core_missing = [s for s in missing_skills if _get_skill_tier(s) == "core"]

    if match_pct >= 70:
        compatibility = "Strong match — your profile aligns well with the job requirements."
    elif match_pct >= 45:
        compatibility = "Moderate match — you have relevant skills but a few gaps to address."
    else:
        compatibility = "Lower match — this role requires different core skills from your profile."

    tier_breakdown = {
        "core_matched": core_matched[:5],
        "core_missing": core_missing[:5],
        "secondary_matched": [s for s in matched_skills if _get_skill_tier(s) == "secondary"][:5],
        "secondary_missing": [s for s in missing_skills if _get_skill_tier(s) == "secondary"][:5],
    }

    return MatchExplanation(
        summary=summary,
        matched_skills_detail=matched_skills[:8],
        missing_skills_detail=missing_skills[:8],
        compatibility=compatibility,
        skill_tier_breakdown=tier_breakdown,
    )


def _scale_match_percentage(cosine_sim: float) -> float:
    scaled = ((cosine_sim - 0.05) / 0.60) * 80 + 15
    return max(10, min(98, scaled))


def _find_matched_skills(
    user_skills: List[str],
    job_description: str
) -> List[str]:
    job_lower = job_description.lower()
    matched = []
    for skill in user_skills:
        s = skill.lower()
        if s == "r" or s == "go" or s == "c#":
            if re.search(r'\b' + re.escape(s) + r'\b', job_lower):
                matched.append(skill)
        elif s == "java":
            if re.search(r'\bjava\b(?!script)', job_lower):
                matched.append(skill)
        else:
            if s in job_lower:
                matched.append(skill)
    return list(dict.fromkeys(matched))


def _keyword_match_fallback(
    profile_text: str,
    user_skills: List[str],
    jobs: List[Dict],
    user_role: str = "fullstack",
) -> List[JobResult]:
    profile_lower = profile_text.lower()
    user_skill_set = {s.lower() for s in user_skills}

    results = []
    for i, job in enumerate(jobs):
        job_desc = job.get("description", "").lower()
        job_title = job.get("title", "").lower()
        job_text = f"{job_title} {job_desc}"

        matched_skills_list = []
        for s in user_skills:
            sl = s.lower()
            if sl == "r" or sl == "go":
                if re.search(r'\b' + re.escape(sl) + r'\b', job_text):
                    matched_skills_list.append(s)
            elif sl == "java":
                if re.search(r'\bjava\b(?!script)', job_text):
                    matched_skills_list.append(s)
            else:
                if sl in job_text:
                    matched_skills_list.append(s)

        skill_score = len(matched_skills_list) / max(len(user_skill_set), 1)
        job_words = set(job_text.split())
        profile_words = set(profile_lower.split())
        overlap = len(job_words.intersection(profile_words))
        word_score = min(overlap / 20, 1.0)

        match_pct = (skill_score * 70 + word_score * 30)
        role_boost = get_role_boost(user_role, job)
        match_pct = max(10, min(98, match_pct * role_boost))

        missing = identify_missing_skills(list(user_skill_set), job_text)

        explanation = _generate_explanation(
            profile_text, list(user_skill_set), matched_skills_list,
            missing, match_pct, 0.0, job, user_role
        )

        results.append(JobResult(
            job_id=job.get("job_id", f"job_{i}"),
            title=job.get("title", "Untitled"),
            company=job.get("company", "Unknown"),
            location=job.get("location", "Remote"),
            description=job.get("description", ""),
            salary_min=job.get("salary_min"),
            salary_max=job.get("salary_max"),
            category=job.get("category", ""),
            url=job.get("url", ""),
            match_percentage=round(match_pct, 1),
            matched_skills=matched_skills_list[:8],
            missing_skills=missing[:8],
            explanation=explanation,
            created=job.get("created"),
        ))

    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results
