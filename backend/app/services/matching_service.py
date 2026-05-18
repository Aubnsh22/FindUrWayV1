import logging
import re
from typing import List, Dict, Tuple, Set
from app.models.schemas import JobResult, MatchExplanation
from app.services.nlp_service import (
    get_model, generate_embedding, generate_embeddings_batch,
    compute_similarity_batch
)
from app.services.skill_service import (
    extract_skills, identify_missing_skills, detect_career_role, get_role_boost,
    detect_user_domain, detect_job_domain, get_domain_compatibility,
    detect_role_type, detect_aspirations, TECHNOLOGY_DOMAINS,
    GENERIC_ENGINEERING_SKILLS, ROLE_TYPE_SIGNALS,
)
from app.services.skill_service import TECHNICAL_SKILLS, FRAMEWORKS_AND_TOOLS

logger = logging.getLogger(__name__)

ROLE_LABELS = {
    "javascript_fullstack": "Full Stack JavaScript Developer",
    "frontend": "Frontend Developer",
    "backend_node": "Node.js Backend Developer",
    "fullstack": "Full Stack Developer",
    "cloud_devops": "Cloud Platform Engineer",
    "aiml": "AI/ML Engineer",
    "dataengineering": "Data Engineer",
    "devops": "DevOps Engineer",
    "mobile": "Mobile Developer",
    "datascience": "Data Scientist",
}

NEIGHBOR_MAP = {
    "Casablanca": ["Rabat", "Temara", "Sale", "Kenitra", "El jadida"],
    "Rabat": ["Temara", "Sale", "Casablanca", "Kenitra"],
    "Tangier": ["Tetouan", "Nador"],
    "Tetouan": ["Tangier"],
    "Marrakech": ["Agadir"],
    "Agadir": ["Marrakech"],
    "Fes": ["Meknes"],
    "Meknes": ["Fes"],
}

DOMAIN_NAME_MAP = {k: v["name"] for k, v in TECHNOLOGY_DOMAINS.items()}

# BI categories that should be penalised heavily for non-data roles
BI_CATEGORIES = {"business intelligence", "data analytics", "data science"}
# JS-cluster roles that should never match BI/DA/DS categories
JS_CLUSTER_ROLES = {"javascript_fullstack", "frontend", "backend_node", "fullstack", "cloud_devops", "devops", "mobile"}

# ─── Helpers ────────────────────────────────────────────────────

def _all_user_skills_from_analysis(profile_skills) -> List[str]:
    return list(set(
        s.lower() for s in (
            profile_skills.technical_skills +
            profile_skills.soft_skills +
            profile_skills.tools +
            profile_skills.languages +
            profile_skills.frameworks
        )
    ))


def _build_job_text(job: Dict) -> str:
    parts = [
        job.get("title", ""),
        job.get("description", ""),
        job.get("company", ""),
        job.get("category", ""),
    ]
    return " ".join(p for p in parts if p)


def _extract_city(profile_text: str, preferred_city: str = "") -> str:
    if preferred_city:
        return preferred_city.capitalize()
    cities = [
        "casablanca", "rabat", "marrakech", "tangier", "fes",
        "agadir", "meknes", "oujda", "kenitra", "tetouan",
        "temara", "sale", "nador", "el jadida"
    ]
    for city in cities:
        if city in profile_text.lower():
            return city.capitalize()
    return ""


def _find_matched_skills(user_skills: List[str], job_description: str) -> List[str]:
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
        elif s == "react":
            # Require technical context: capital R, React.js, or React Native
            if re.search(r'\bReact\b', job_description) or 'react.js' in job_lower or 'reactjs' in job_lower or 'react native' in job_lower:
                matched.append(skill)
        elif s == "node.js":
            # Match node.js, nodejs, or "node js" (common variations)
            if 'node.js' in job_lower or 'nodejs' in job_lower or 'node js' in job_lower:
                matched.append(skill)
        elif s == "next.js":
            if 'next.js' in job_lower or 'nextjs' in job_lower or 'next js' in job_lower:
                matched.append(skill)
        elif s == "express":
            # Express.js framework, not "express" as a verb
            if re.search(r'\bExpress\b', job_description) or 'express.js' in job_lower or 'expressjs' in job_lower:
                matched.append(skill)
        else:
            if s in job_lower:
                matched.append(skill)
    return list(dict.fromkeys(matched))


def _compute_stack_compatibility_score(
    user_skills: Set[str],
    job_text: str,
    user_domain: str,
    job_domain: str,
) -> float:
    """Compute how well the user's domain-specific stack matches this job.
    Returns a score 0-100."""
    domain_compat = get_domain_compatibility(user_domain, job_domain)

    # Collect all signature skills from both user and job domains
    relevant_domain_skills = set()
    for d in (user_domain, job_domain):
        domain_def = TECHNOLOGY_DOMAINS.get(d)
        if domain_def:
            relevant_domain_skills |= domain_def["signature_skills"]

    user_relevant = user_skills & relevant_domain_skills

    # How many of the user's domain skills appear in the job text?
    if user_relevant:
        user_hits_in_job = sum(1 for s in user_relevant if s in job_text)
        user_coverage = user_hits_in_job / len(user_relevant)
    else:
        user_coverage = 0.0

    # How many of the job's domain skills does the user have?
    job_domain_def = TECHNOLOGY_DOMAINS.get(job_domain)
    if job_domain_def:
        job_signature = job_domain_def["signature_skills"]
        job_skills_in_job = {s for s in job_signature if s in job_text}
        if job_skills_in_job:
            user_job_overlap = len(user_skills & job_skills_in_job)
            job_coverage = user_job_overlap / len(job_skills_in_job)
        else:
            job_coverage = 0.0
    else:
        job_coverage = 0.0

    raw_stack_score = (user_coverage * 0.5 + job_coverage * 0.5) * 100
    return raw_stack_score * domain_compat


def _compute_weighted_score(
    user_skills: List[str],
    job: Dict,
    base_score: float,
    user_role: str,
    user_domain: str,
    aspirations: List[str] = None,
) -> float:
    user_skill_set = {s.lower() for s in user_skills}
    job_text = _build_job_text(job).lower()
    job_category = (job.get("category") or "").lower()
    aspirations = aspirations or []

    # ── Category-based hard block ──
    if user_role in JS_CLUSTER_ROLES and any(bc in job_category for bc in BI_CATEGORIES):
        return max(10, base_score * 0.15)

    # ── Domain-aware stack compatibility ──
    job_domain = detect_job_domain(job)
    stack_score = _compute_stack_compatibility_score(
        user_skill_set, job_text, user_domain, job_domain
    )

    # ── Role-type experience context ──
    user_role_type = detect_role_type(" ".join(user_skills))
    job_role_type = detect_role_type(job_text)
    experience_penalty = 1.0
    if user_role_type == "engineering" and job_role_type in ("operations", "management"):
        eng_signals = sum(1 for s in ROLE_TYPE_SIGNALS["engineering"] if s in job_text)
        if eng_signals < 2:
            experience_penalty = 0.4
        elif eng_signals < 4:
            experience_penalty = 0.7

    # ── Domain-specific stack match (non-generic skills only) ──
    matched_count = 0
    possible_count = 0
    for skill in user_skill_set:
        if skill in GENERIC_ENGINEERING_SKILLS:
            continue
        if skill in job_text:
            matched_count += 1
        possible_count += 1

    non_generic_ratio = (matched_count / possible_count) if possible_count > 0 else 0.0
    non_generic_score = non_generic_ratio * 100

    # ── Same-domain boost ──
    same_domain_boost = 1.0
    if user_domain == job_domain and stack_score > 20:
        same_domain_boost = 1.20
    elif get_domain_compatibility(user_domain, job_domain) >= 0.6:
        same_domain_boost = 1.05

    # ── Aspiration boost: if user is learning a domain and job is in it ──
    aspiration_boost = 1.0
    if aspirations and any(a == job_domain for a in aspirations):
        aspiration_boost = 1.15

    # ── Final blend ──
    skill_component = stack_score * 0.50 + non_generic_score * 0.30 + base_score * 0.20
    skill_component *= experience_penalty
    skill_component *= same_domain_boost
    skill_component *= aspiration_boost

    role_boost = get_role_boost(user_role, job)
    skill_component *= role_boost

    return max(10, min(98, skill_component))


def _generate_explanation(
    profile_text: str,
    user_skills: List[str],
    matched_skills: List[str],
    missing_skills: List[str],
    match_pct: float,
    raw_similarity: float,
    job: Dict,
    user_role: str = "fullstack",
    user_domain: str = "modern_web",
    job_domain: str = "modern_web",
    aspirations: List[str] = None,
) -> MatchExplanation:
    title = job.get("title", "this role")
    company = job.get("company", "")
    role_label = ROLE_LABELS.get(user_role, "Tech Professional")
    user_domain_name = DOMAIN_NAME_MAP.get(user_domain, user_domain)
    job_domain_name = DOMAIN_NAME_MAP.get(job_domain, job_domain)
    aspirations = aspirations or []

    # Build a recruiter-style summary
    domain_note = ""
    if user_domain == job_domain:
        domain_note = f"in the {user_domain_name} space — your core stack is a strong foundation here"
    elif get_domain_compatibility(user_domain, job_domain) >= 0.6:
        domain_note = f"in {job_domain_name} — your skills partially transfer from {user_domain_name}"
    elif get_domain_compatibility(user_domain, job_domain) >= 0.3:
        domain_note = f"in {job_domain_name} — limited stack overlap with {user_domain_name}"
    else:
        domain_note = f"in {job_domain_name} — very different technology stack from {user_domain_name}"

    # Aspiration note
    aspiration_note = ""
    if aspirations and any(a == job_domain for a in aspirations):
        domain_name = DOMAIN_NAME_MAP.get(job_domain, job_domain)
        aspiration_note = f" Your profile signals interest in {domain_name}, and this role aligns with that trajectory."

    # Filter out generic skills for a more meaningful story
    meaningful_matched = [s for s in matched_skills if s.lower() not in GENERIC_ENGINEERING_SKILLS]
    top_matched = meaningful_matched[:4] if meaningful_matched else matched_skills[:2]

    if match_pct >= 75:
        if top_matched:
            summary = (
                f"As a {role_label}, your stack is a strong match for {title} at {company}. "
                f"Your experience with {', '.join(top_matched[:3])} directly maps to what this role requires "
                f"{domain_note}."
            )
        else:
            summary = (
                f"As a {role_label}, your profile fits {title} at {company} well. "
                f"Your core skills and experience align with the {user_domain_name} domain."
            )
    elif match_pct >= 55:
        if top_matched:
            summary = (
                f"As a {role_label}, you're a solid candidate for {title} at {company}. "
                f"Your strengths in {', '.join(top_matched[:3])} are relevant, and the role sits "
                f"{domain_note}."
            )
        else:
            summary = (
                f"Your {role_label} profile has reasonable alignment with {title} at {company}. "
                f"The role sits {domain_note}."
            )
    elif match_pct >= 35:
        if top_matched:
            summary = (
                f"Your {role_label} background partially overlaps with {title} at {company}. "
                f"While you know {', '.join(top_matched[:2])}, the role sits {domain_note}."
            )
        else:
            summary = (
                f"Your {role_label} profile has limited connection to {title} at {company}. "
                f"The role sits {domain_note}."
            )
    else:
        summary = (
            f"Lower alignment between your {role_label} profile and {title} at {company}. "
            f"The role requires {job_domain_name} expertise, while you work in {user_domain_name}."
        )

    if aspiration_note:
        summary += aspiration_note

    core_matched = [s for s in meaningful_matched if s.lower() not in GENERIC_ENGINEERING_SKILLS][:5]
    core_missing = [s for s in missing_skills if s.lower() not in GENERIC_ENGINEERING_SKILLS][:5]

    if match_pct >= 70:
        compatibility = f"Strong alignment — your {user_domain_name} background is a great fit for this {job_domain_name} role."
    elif match_pct >= 50:
        compatibility = f"Good alignment — your {user_domain_name} skills transfer well to this {job_domain_name} position."
    elif match_pct >= 30:
        compatibility = f"Partial alignment — your {user_domain_name} experience has some overlap with this {job_domain_name} role."
    else:
        compatibility = f"Limited alignment — this {job_domain_name} role requires a different core stack from your {user_domain_name} background."

    return MatchExplanation(
        summary=summary,
        matched_skills_detail=matched_skills[:8],
        missing_skills_detail=missing_skills[:8],
        compatibility=compatibility,
        skill_tier_breakdown={
            "domain_relevant_matched": core_matched[:5],
            "domain_relevant_missing": core_missing[:5],
            "user_domain": user_domain_name,
            "job_domain": job_domain_name,
        },
    )


def _scale_match_percentage(cosine_sim: float) -> float:
    scaled = ((cosine_sim - 0.05) / 0.60) * 80 + 15
    return max(10, min(98, scaled))


# ── Main entry point ────────────────────────────────────────────

def match_profile_to_jobs(
    profile_text: str,
    jobs: List[Dict],
    preferred_city: str = "",
    min_match_score: float = 0.0,
    preferred_categories: List[str] = None,
) -> List[JobResult]:
    if not jobs:
        return []

    profile_skills = extract_skills(profile_text)
    all_user_skills = _all_user_skills_from_analysis(profile_skills)

    user_role, secondary_role, role_confidence = detect_career_role(profile_skills)
    user_domain = detect_user_domain(profile_skills)
    aspirations = detect_aspirations(profile_text)

    logger.info(
        f"Detected role: {user_role} (confidence: {role_confidence:.2f}), "
        f"domain: {DOMAIN_NAME_MAP.get(user_domain, user_domain)}, "
        f"skills: {all_user_skills}, aspirations: {aspirations}"
    )

    model = get_model()
    if model is None:
        logger.warning("NLP model not available, using keyword matching fallback")
        return _keyword_match_fallback(
            profile_text, all_user_skills, jobs, user_role, user_domain,
            preferred_city, min_match_score, preferred_categories,
            aspirations,
        )

    try:
        profile_emb = generate_embedding(profile_text)
        job_texts = [_build_job_text(job) for job in jobs]
        job_embs = generate_embeddings_batch(job_texts)
        similarities = compute_similarity_batch(profile_emb, job_embs)
    except Exception as e:
        logger.error(f"Embedding failed: {e}, falling back to keyword matching")
        return _keyword_match_fallback(
            profile_text, all_user_skills, jobs, user_role, user_domain,
            preferred_city, min_match_score, preferred_categories,
            aspirations,
        )

    extracted_city = _extract_city(profile_text, preferred_city)
    preferred_cats = [c.lower() for c in (preferred_categories or [])]

    results = []
    for i, job in enumerate(jobs):
        sim = similarities[i] if i < len(similarities) else 0.0
        scaled_nlp = _scale_match_percentage(sim)

        job_domain = detect_job_domain(job)
        weighted = _compute_weighted_score(
            all_user_skills, job, scaled_nlp, user_role, user_domain, aspirations
        )

        job_desc = job.get("description", "") + " " + job.get("title", "")
        matched = _find_matched_skills(all_user_skills, job_desc)
        missing = identify_missing_skills(all_user_skills, job_desc)

        # ── Smart filters ──

        # 1. Zero meaningful skill match penalty
        meaningful_matched = [s for s in matched if s.lower() not in GENERIC_ENGINEERING_SKILLS]
        if len(meaningful_matched) == 0:
            weighted = max(10, weighted * 0.3)

        # 2. Category preference boost (gentle)
        cat = (job.get("category") or "").lower()
        if preferred_cats and cat in preferred_cats:
            weighted += 5

        # 3. Location boost (city-specific + Morocco-wide)
        location_boost = 0.0
        location_note = ""
        job_loc = job.get("location", "Remote").lower()
        if extracted_city:
            city_lower = extracted_city.lower()
            if city_lower in job_loc:
                location_boost = 14.0
                location_note = f" (Located in {extracted_city})"
            else:
                neighbors = NEIGHBOR_MAP.get(extracted_city, [])
                for n in neighbors:
                    if n.lower() in job_loc:
                        location_boost = 8.0
                        location_note = f" (Commutable from {extracted_city})"
                        break

        # Morocco-wide presence boost (any city in Morocco gets a lift)
        if not location_boost and any(m in job_loc for m in ["morocco", "maroc"]):
            location_boost = 5.0
            location_note = f" (Based in Morocco)"

        final_pct = weighted + location_boost
        final_pct = max(10, min(99, final_pct))

        # 4. Enforce minimum match
        if final_pct < min_match_score:
            continue

        explanation = _generate_explanation(
            profile_text, all_user_skills, matched, missing,
            final_pct, sim, job, user_role, user_domain, job_domain,
            aspirations,
        )
        if location_note:
            explanation.summary = f"{explanation.summary}{location_note}"

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


# ── Fallback (no NLP model) ──────────────────────────────────────

def _keyword_match_fallback(
    profile_text: str,
    user_skills: List[str],
    jobs: List[Dict],
    user_role: str = "fullstack",
    user_domain: str = "modern_web",
    preferred_city: str = "",
    min_match_score: float = 0.0,
    preferred_categories: List[str] = None,
    aspirations: List[str] = None,
) -> List[JobResult]:
    profile_lower = profile_text.lower()
    user_skill_set = {s.lower() for s in user_skills}
    aspirations = aspirations or []

    extracted_city = _extract_city(profile_text, preferred_city)
    preferred_cats = [c.lower() for c in (preferred_categories or [])]

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
            elif sl == "react":
                if re.search(r'\bReact\b', job_text) or 'react.js' in job_text or 'reactjs' in job_text or 'react native' in job_text:
                    matched_skills_list.append(s)
            elif sl == "node.js":
                if 'node.js' in job_text or 'nodejs' in job_text or 'node js' in job_text:
                    matched_skills_list.append(s)
            elif sl == "next.js":
                if 'next.js' in job_text or 'nextjs' in job_text or 'next js' in job_text:
                    matched_skills_list.append(s)
            elif sl == "express":
                if re.search(r'\bExpress\b', job_text) or 'express.js' in job_text or 'expressjs' in job_text:
                    matched_skills_list.append(s)
            else:
                if sl in job_text:
                    matched_skills_list.append(s)

        # Domain-aware stack scoring
        job_domain = detect_job_domain(job)
        job_text_for_compat = job_text
        stack_score = _compute_stack_compatibility_score(
            user_skill_set, job_text_for_compat, user_domain, job_domain
        )

        # Non-generic skill ratio
        matched_count = sum(1 for s in user_skill_set if s not in GENERIC_ENGINEERING_SKILLS and s in job_text)
        possible_count = sum(1 for s in user_skill_set if s not in GENERIC_ENGINEERING_SKILLS)
        non_generic_ratio = (matched_count / possible_count) if possible_count > 0 else 0.0

        # Word overlap (profile ↔ job)
        job_words = set(job_text.split())
        profile_words = set(profile_lower.split())
        overlap = len(job_words.intersection(profile_words))
        word_score = min(overlap / 20, 1.0) * 100

        base_match_pct = stack_score * 0.50 + non_generic_ratio * 100 * 0.30 + word_score * 0.20

        # Experience context
        user_role_type = detect_role_type(" ".join(user_skills))
        job_role_type = detect_role_type(job_text)
        if user_role_type == "engineering" and job_role_type in ("operations", "management"):
            eng_signals = sum(1 for s in ROLE_TYPE_SIGNALS["engineering"] if s in job_text)
            if eng_signals < 2:
                base_match_pct *= 0.4
            elif eng_signals < 4:
                base_match_pct *= 0.7

        # Same-domain boost
        if user_domain == job_domain and stack_score > 20:
            base_match_pct *= 1.20
        elif get_domain_compatibility(user_domain, job_domain) >= 0.6:
            base_match_pct *= 1.05

        # Aspiration boost
        if aspirations and any(a == job_domain for a in aspirations):
            base_match_pct *= 1.15

        role_boost = get_role_boost(user_role, job)
        base_match_pct *= role_boost

        # Zero meaningful skill match penalty
        meaningful = [s for s in matched_skills_list if s.lower() not in GENERIC_ENGINEERING_SKILLS]
        if len(meaningful) == 0:
            base_match_pct = max(10, base_match_pct * 0.3)

        cat = (job.get("category") or "").lower()
        if preferred_cats and cat in preferred_cats:
            base_match_pct += 5

        location_boost = 0.0
        location_note = ""
        job_loc = job.get("location", "Remote").lower()
        if extracted_city:
            city_lower = extracted_city.lower()
            if city_lower in job_loc:
                location_boost = 14.0
                location_note = f" (Located in {extracted_city})"
            else:
                neighbors = NEIGHBOR_MAP.get(extracted_city, [])
                for n in neighbors:
                    if n.lower() in job_loc:
                        location_boost = 8.0
                        location_note = f" (Commutable from {extracted_city})"
                        break

        # Morocco-wide boost
        if not location_boost and any(m in job_loc for m in ["morocco", "maroc"]):
            location_boost = 5.0
            location_note = f" (Based in Morocco)"

        final_match_pct = base_match_pct + location_boost
        final_match_pct = max(10, min(99, final_match_pct))

        if final_match_pct < min_match_score:
            continue

        missing = identify_missing_skills(list(user_skill_set), job_text)

        explanation = _generate_explanation(
            profile_text, list(user_skill_set), matched_skills_list,
            missing, final_match_pct, 0.0, job, user_role,
            user_domain, job_domain, aspirations,
        )
        if location_note:
            explanation.summary = f"{explanation.summary}{location_note}"

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
            match_percentage=round(final_match_pct, 1),
            matched_skills=matched_skills_list[:8],
            missing_skills=missing[:8],
            explanation=explanation,
            created=job.get("created"),
        ))

    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results
