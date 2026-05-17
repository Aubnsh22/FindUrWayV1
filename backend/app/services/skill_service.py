"""
Skill Extraction Service — Extracts skills from text and identifies gaps.
Uses keyword matching with word-boundary regex for accurate detection.
"""
from typing import List, Dict, Tuple
from app.models.schemas import SkillAnalysis, CareerInsight, LearningPath
import re
import logging

logger = logging.getLogger(__name__)

# ─── Comprehensive Skill Dictionaries ──────────────────────────

TECHNICAL_SKILLS = {
    "python", "java", "javascript", "typescript", "c++", "c#", "r", "scala",
    "go", "rust", "kotlin", "swift", "php", "ruby", "matlab", "julia",
    "machine learning", "deep learning", "natural language processing", "nlp",
    "computer vision", "reinforcement learning", "neural networks", "statistics",
    "data mining", "data analysis", "data visualization", "data engineering",
    "feature engineering", "model deployment", "mlops", "a/b testing",
    "time series", "recommendation systems", "anomaly detection",
    "predictive modeling", "regression", "classification", "clustering",
    "artificial intelligence", "generative ai", "llm", "transformers",
    "rag", "fine-tuning", "prompt engineering", "langchain",
    "big data", "hadoop", "spark", "kafka", "hive", "pig",
    "data warehouse", "etl", "data pipeline", "data lake",
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd",
    "terraform", "ansible", "jenkins", "github actions",
    "sql", "nosql", "postgresql", "mysql", "mongodb", "redis",
    "elasticsearch", "cassandra", "neo4j", "sqlite",
    "business intelligence", "tableau", "power bi", "looker",
    "qlik", "sap", "excel", "reporting", "dashboards", "kpi",
    "react", "angular", "vue", "node.js", "express", "django",
    "flask", "fastapi", "spring boot", "rest api", "graphql",
    "html", "css", "tailwindcss", "next.js",
    "software engineering", "system design", "microservices",
    "agile", "scrum", "git", "testing", "unit testing",
    "api design", "oop", "design patterns", "clean code",
}

FRAMEWORKS_AND_TOOLS = {
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "seaborn", "plotly", "scipy", "nltk", "spacy",
    "hugging face", "opencv", "xgboost", "lightgbm", "catboost",
    "airflow", "mlflow", "dbt", "great expectations", "prefect",
    "streamlit", "gradio", "jupyter", "databricks", "snowflake",
    "sagemaker", "vertex ai", "azure ml", "docker", "kubernetes",
    "git", "github", "gitlab", "jira", "confluence",
    "figma", "postman", "swagger", "grafana", "prometheus",
}

SOFT_SKILLS = {
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "project management", "analytical",
    "presentation", "stakeholder management", "mentoring",
    "collaboration", "adaptability", "creativity", "innovation",
    "time management", "decision making", "strategic thinking",
}

PROGRAMMING_LANGUAGES = {
    "python", "java", "javascript", "typescript", "c++", "c#",
    "r", "scala", "go", "rust", "kotlin", "swift", "php",
    "ruby", "matlab", "julia", "sql", "bash", "shell",
}

# ─── Skills that need word-boundary regex (short names that cause false positives) ──
SHORT_SKILLS = {"r", "go", "c#", "c++", "sql", "css", "html", "nlp", "git", "rag", "kpi"}

# ─── Role taxonomy ──────────────────────────────────────────────

ROLES = {
    "frontend": {
        "keywords": {"react", "angular", "vue", "html", "css", "tailwindcss", "next.js", "frontend", "ui", "ux"},
        "core_skills": {"javascript", "typescript", "react", "html", "css"},
        "penalize": {"java", "spark", "hadoop", "mlops", "deep learning", "tensorflow", "pytorch", "spring boot"},
        "weight_boost": 1.3,
    },
    "backend": {
        "keywords": {"node.js", "express", "django", "flask", "fastapi", "spring boot", "rest api", "backend", "api", "microservices"},
        "core_skills": {"python", "java", "node.js", "sql", "rest api", "git"},
        "penalize": {"react", "angular", "vue", "html", "css", "tensorflow", "pytorch"},
        "weight_boost": 1.2,
    },
    "fullstack": {
        "keywords": {"full stack", "fullstack", "react", "node.js", "typescript", "javascript", "html", "css", "rest api"},
        "core_skills": {"javascript", "typescript", "react", "node.js", "sql", "git", "html", "css"},
        "penalize": {"java", "tensorflow", "pytorch", "r", "spark", "hadoop"},
        "weight_boost": 1.25,
    },
    "aiml": {
        "keywords": {"machine learning", "deep learning", "nlp", "computer vision", "artificial intelligence", "tensorflow", "pytorch", "neural networks", "mlops"},
        "core_skills": {"python", "machine learning", "deep learning", "tensorflow", "pytorch", "statistics", "nlp"},
        "penalize": {"react", "angular", "vue", "html", "css", "spring boot", "php", "ruby"},
        "weight_boost": 1.3,
    },
    "dataengineering": {
        "keywords": {"spark", "kafka", "airflow", "data pipeline", "etl", "data warehouse", "data lake", "hadoop", "data engineering"},
        "core_skills": {"python", "sql", "spark", "airflow", "docker", "aws", "kafka"},
        "penalize": {"react", "angular", "vue", "html", "css", "tensorflow", "pytorch"},
        "weight_boost": 1.2,
    },
    "devops": {
        "keywords": {"docker", "kubernetes", "ci/cd", "terraform", "ansible", "jenkins", "github actions", "devops", "cloud"},
        "core_skills": {"docker", "kubernetes", "aws", "azure", "gcp", "linux", "git", "ci/cd"},
        "penalize": {"react", "angular", "vue", "tensorflow", "pytorch", "r"},
        "weight_boost": 1.2,
    },
    "mobile": {
        "keywords": {"swift", "kotlin", "android", "ios", "react native", "flutter", "mobile"},
        "core_skills": {"kotlin", "swift", "java", "javascript", "react"},
        "penalize": {"spark", "hadoop", "tensorflow", "pytorch", "mlops"},
        "weight_boost": 1.3,
    },
    "datascience": {
        "keywords": {"data science", "statistics", "data analysis", "data visualization", "machine learning", "python", "r", "sql"},
        "core_skills": {"python", "sql", "statistics", "machine learning", "pandas", "scikit-learn"},
        "penalize": {"react", "angular", "vue", "spring boot", "html", "css"},
        "weight_boost": 1.2,
    },
}

# ─── Skills required by job category ───────────────────────────

CATEGORY_SKILLS = {
    "Data Science": [
        "python", "r", "statistics", "machine learning", "deep learning",
        "pandas", "scikit-learn", "tensorflow", "pytorch", "sql",
        "data visualization", "jupyter", "numpy", "feature engineering"
    ],
    "AI / Machine Learning": [
        "python", "deep learning", "machine learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "transformers", "neural networks", "mlops",
        "generative ai", "llm", "langchain", "rag"
    ],
    "Data Analytics": [
        "sql", "python", "excel", "tableau", "power bi",
        "data visualization", "statistics", "reporting", "dashboards",
        "a/b testing", "kpi", "data analysis"
    ],
    "Business Intelligence": [
        "sql", "power bi", "tableau", "excel", "reporting",
        "dashboards", "etl", "data warehouse", "sap", "kpi",
        "business intelligence", "looker", "qlik"
    ],
    "Software Engineering": [
        "python", "java", "javascript", "git", "rest api",
        "microservices", "docker", "testing", "agile", "sql",
        "system design", "ci/cd", "clean code", "design patterns"
    ],
    "Data Engineering": [
        "python", "sql", "spark", "kafka", "airflow",
        "etl", "data pipeline", "docker", "aws", "data warehouse",
        "hadoop", "data lake", "dbt", "snowflake"
    ],
}


def _word_boundary_match(skill: str, text: str) -> bool:
    """Match skill using word boundaries to avoid false positives."""
    pattern = r'\b' + re.escape(skill) + r'\b'
    return bool(re.search(pattern, text, re.IGNORECASE))


def extract_skills(text: str) -> SkillAnalysis:
    text_lower = text.lower()

    found_technical = []
    found_soft = []
    found_tools = []
    found_languages = []
    found_frameworks = []

    for skill in TECHNICAL_SKILLS:
        if skill in SHORT_SKILLS:
            if _word_boundary_match(skill, text_lower):
                # Special case: "java" should not match "javascript"
                if skill == "java" and _word_boundary_match(r"javascript", text_lower):
                    if not _word_boundary_match(r"\bjava\b(?!script)", text_lower):
                        continue
                found_technical.append(skill.title())
        else:
            if skill in text_lower:
                found_technical.append(skill.title())

    for tool in FRAMEWORKS_AND_TOOLS:
        if tool in text_lower:
            found_frameworks.append(tool.title())

    for skill in SOFT_SKILLS:
        if skill in text_lower:
            found_soft.append(skill.title())

    for lang in PROGRAMMING_LANGUAGES:
        if lang in SHORT_SKILLS:
            if _word_boundary_match(lang, text_lower):
                # Special: java != javascript
                if lang == "java" and "javascript" in text_lower:
                    continue
                found_languages.append(lang.title())
        else:
            if lang in text_lower:
                found_languages.append(lang.title())

    found_technical = list(dict.fromkeys(found_technical))
    found_frameworks = list(dict.fromkeys(found_frameworks))
    found_soft = list(dict.fromkeys(found_soft))
    found_languages = list(dict.fromkeys(found_languages))

    return SkillAnalysis(
        technical_skills=found_technical[:20],
        soft_skills=found_soft[:10],
        tools=found_tools[:15],
        languages=found_languages[:10],
        frameworks=found_frameworks[:15],
    )


def detect_career_role(skills: SkillAnalysis) -> Tuple[str, str, float]:
    """
    Detect the user's most likely career role based on extracted skills.
    Returns (primary_role, secondary_role, confidence).
    """
    all_skills = set(
        s.lower() for s in (
            skills.technical_skills + skills.frameworks +
            skills.tools + skills.languages
        )
    )

    role_scores = {}
    for role_name, role_def in ROLES.items():
        score = 0
        for skill in all_skills:
            if skill in role_def["keywords"]:
                score += 2
            if skill in role_def["core_skills"]:
                score += 3
            if skill in role_def.get("penalize", set()):
                score -= 1
        role_scores[role_name] = score

    sorted_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_roles[0][0] if sorted_roles else "fullstack"
    secondary = sorted_roles[1][0] if len(sorted_roles) > 1 else primary
    max_score = sorted_roles[0][1] if sorted_roles else 1
    total = sum(s for _, s in sorted_roles) or 1
    confidence = min(max_score / total * 2, 1.0) if max_score > 0 else 0.3

    return primary, secondary, confidence


def get_role_boost(user_role: str, job: Dict) -> float:
    """Return match multiplier based on how well a job aligns with the user's role."""
    role_def = ROLES.get(user_role)
    if not role_def:
        return 1.0

    job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('category', '')}".lower()

    boost = role_def.get("weight_boost", 1.0)

    for skill in role_def.get("penalize", set()):
        if skill in job_text:
            boost = max(0.3, boost - 0.3)

    return boost


ROLE_SPECIFIC_LEARNING = {
    "frontend": [
        ("TypeScript", 12, "Type safety and modern JS features for frontend roles", "high"),
        ("Next.js", 10, "React meta-framework for production apps", "high"),
        ("CSS/Tailwind", 8, "Modern styling and responsive design", "medium"),
        ("Testing (Jest/Cypress)", 10, "Frontend testing for reliable UIs", "high"),
    ],
    "backend": [
        ("PostgreSQL", 10, "Relational database skills for backend roles", "high"),
        ("Docker", 10, "Containerization for backend deployment", "high"),
        ("Redis", 8, "Caching and message queues", "medium"),
        ("CI/CD Pipelines", 9, "Automated testing and deployment", "medium"),
        ("GraphQL", 8, "Modern API query language", "medium"),
    ],
    "fullstack": [
        ("TypeScript", 12, "Type safety across frontend and backend", "high"),
        ("PostgreSQL", 10, "Database skills for full-stack apps", "high"),
        ("Docker", 10, "Containerization for full-stack deployment", "high"),
        ("Next.js", 10, "Full-stack React framework", "high"),
        ("CI/CD Pipelines", 9, "Automated testing and deployment", "medium"),
        ("Testing", 9, "Frontend and backend test frameworks", "medium"),
    ],
    "aiml": [
        ("MLOps", 13, "ML model deployment and monitoring", "high"),
        ("Docker", 10, "Containerization for ML models", "high"),
        ("Spark", 11, "Big data processing for ML pipelines", "high"),
        ("Cloud (AWS/GCP)", 11, "Cloud ML services and deployment", "high"),
        ("Kubernetes", 10, "Orchestration for ML workloads", "medium"),
    ],
    "dataengineering": [
        ("Airflow", 11, "Pipeline orchestration", "high"),
        ("Spark", 12, "Distributed data processing", "high"),
        ("Kafka", 10, "Stream processing", "high"),
        ("dbt", 9, "Data transformation", "medium"),
        ("Snowflake", 9, "Cloud data warehousing", "medium"),
    ],
    "devops": [
        ("Kubernetes", 12, "Container orchestration at scale", "high"),
        ("Terraform", 11, "Infrastructure as code", "high"),
        ("CI/CD Pipelines", 10, "Automated deployment pipelines", "high"),
        ("Monitoring (Grafana/Prometheus)", 9, "System observability", "medium"),
        ("AWS/Azure Certifications", 10, "Cloud platform expertise", "high"),
    ],
    "mobile": [
        ("React Native", 12, "Cross-platform mobile development", "high"),
        ("Flutter", 10, "Dart-based mobile framework", "high"),
        ("Firebase", 9, "Backend services for mobile apps", "medium"),
        ("App Store Deployment", 8, "iOS/Android deployment process", "medium"),
    ],
    "datascience": [
        ("MLOps", 12, "Production ML model deployment", "high"),
        ("Spark", 10, "Big data processing", "high"),
        ("Statistics", 10, "Advanced statistical methods for data analysis", "high"),
        ("SQL Window Functions", 9, "Advanced data analysis", "medium"),
        ("Docker", 9, "Reproducible analysis environments", "medium"),
    ],
}


def generate_learning_paths(
    skills: SkillAnalysis,
    top_categories: List[str]
) -> List[LearningPath]:
    all_user_skills = set(
        s.lower() for s in (
            skills.technical_skills + skills.frameworks + skills.languages +
            skills.tools + skills.soft_skills
        )
    )

    role, _, _ = detect_career_role(skills)
    role_paths = ROLE_SPECIFIC_LEARNING.get(role, [])

    paths = []
    for skill_name, impact, reason, priority in role_paths:
        if skill_name.lower() not in all_user_skills and len(paths) < 6:
            from app.models.schemas import LearningPath as LPSchema
            impact_labels = {
                12: "would transform your opportunities",
                10: "would significantly boost your match score",
                7: "would improve your profile strength",
            }
            label = "would boost your career prospects"
            for threshold, lbl in sorted(impact_labels.items(), reverse=True):
                if impact >= threshold:
                    label = lbl
                    break
            paths.append(LPSchema(
                skill=skill_name,
                reason=reason,
                resources=[
                    f"Coursera: {skill_name} Specialization",
                    f"YouTube: {skill_name} Tutorial 2024",
                ],
                priority=priority,
                impact_score=impact,
                impact_label=label,
            ))

    cloud_skills = {"aws", "azure", "gcp", "docker"}
    if not cloud_skills.intersection(all_user_skills):
        from app.models.schemas import LearningPath as LPSchema
        paths.append(LPSchema(
            skill="Cloud Computing (AWS/Azure)",
            reason="Cloud skills are required in 70%+ of tech job postings",
            resources=["AWS Free Tier Labs", "Azure Fundamentals (AZ-900)"],
            priority="high",
            impact_score=10,
            impact_label="would significantly boost your match score",
        ))

    return paths[:8]


def identify_missing_skills(
    user_skills: List[str],
    job_description: str
) -> List[str]:
    job_lower = job_description.lower()
    user_lower = {s.lower() for s in user_skills}

    missing = []
    all_skills = TECHNICAL_SKILLS | FRAMEWORKS_AND_TOOLS

    for skill in all_skills:
        if skill in SHORT_SKILLS:
            if _word_boundary_match(skill, job_lower) and skill not in user_lower:
                # Special: java != javascript
                if skill == "java" and "javascript" in job_lower:
                    if not _word_boundary_match(r"\bjava\b(?!script)", job_lower):
                        continue
                missing.append(skill.title())
        else:
            if skill in job_lower and skill not in user_lower:
                missing.append(skill.title())

    return list(dict.fromkeys(missing))[:10]


def determine_top_categories(skills: SkillAnalysis) -> List[str]:
    all_user_skills = set(
        s.lower() for s in
        skills.technical_skills + skills.frameworks + skills.languages
    )

    category_scores = {}
    for category, required_skills in CATEGORY_SKILLS.items():
        overlap = sum(1 for s in required_skills if s in all_user_skills)
        if overlap > 0:
            score = overlap / len(required_skills)
            category_scores[category] = score

    role, _, _ = detect_career_role(skills)
    role_category_map = {
        "frontend": "Software Engineering",
        "backend": "Software Engineering",
        "fullstack": "Software Engineering",
        "mobile": "Software Engineering",
        "aiml": "AI / Machine Learning",
        "dataengineering": "Data Engineering",
        "devops": "Software Engineering",
        "datascience": "Data Science",
    }
    preferred_cat = role_category_map.get(role)
    if preferred_cat and preferred_cat in category_scores:
        category_scores[preferred_cat] = max(
            category_scores.get(preferred_cat, 0), 0.5
        )

    sorted_cats = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    return [cat for cat, _ in sorted_cats[:5]]


def generate_career_insights(
    skills: SkillAnalysis,
    top_categories: List[str],
    avg_match: float
) -> List[CareerInsight]:
    insights = []

    if avg_match >= 70:
        insights.append(CareerInsight(
            title="Strong Market Fit",
            description=f"Your profile matches {avg_match:.0f}% with current market demands. You're well-positioned for roles in {', '.join(top_categories[:2])}.",
            icon="trophy"
        ))
    elif avg_match >= 40:
        insights.append(CareerInsight(
            title="Growing Potential",
            description=f"Your {avg_match:.0f}% match rate shows solid foundations. Focus on trending skills to boost your competitiveness.",
            icon="trending-up"
        ))
    else:
        insights.append(CareerInsight(
            title="Opportunity to Grow",
            description="The market has specific skill demands. Consider upskilling in trending areas to improve your match rate.",
            icon="target"
        ))

    total_skills = len(skills.technical_skills) + len(skills.frameworks)
    if total_skills >= 15:
        insights.append(CareerInsight(
            title="Diverse Skill Set",
            description=f"You have {total_skills} technical skills — that's impressive! Consider deepening expertise in your top 3 to stand out.",
            icon="layers"
        ))
    elif total_skills >= 8:
        insights.append(CareerInsight(
            title="Solid Foundation",
            description=f"Your {total_skills} skills cover key areas. Adding cloud or MLOps skills could open senior-level opportunities.",
            icon="sparkles"
        ))

    if "AI / Machine Learning" in top_categories:
        insights.append(CareerInsight(
            title="AI/ML Market is Booming",
            description="Morocco's AI sector is growing rapidly. Companies in Casablanca, Rabat, and Tangier are actively hiring for ML roles.",
            icon="brain"
        ))

    if "Business Intelligence" in top_categories or "Data Analytics" in top_categories:
        insights.append(CareerInsight(
            title="BI Demand in Morocco",
            description="Business Intelligence roles are among the most in-demand in Morocco's banking, telecom, and consulting sectors.",
            icon="bar-chart"
        ))

    return insights[:5]


def get_morocco_market_intel() -> dict:
    return {
        "trending_sectors": [
            {"sector": "AI & Machine Learning", "growth_pct": 35.0, "demand_level": "very high", "key_skills": ["Python", "TensorFlow", "NLP", "Computer Vision", "MLOps"]},
            {"sector": "Data Engineering", "growth_pct": 28.0, "demand_level": "high", "key_skills": ["Spark", "Airflow", "Kafka", "SQL", "Cloud"]},
            {"sector": "Cybersecurity", "growth_pct": 25.0, "demand_level": "high", "key_skills": ["Network Security", "Cloud Security", "SOC", "Pen Testing"]},
            {"sector": "Cloud & DevOps", "growth_pct": 30.0, "demand_level": "very high", "key_skills": ["AWS", "Azure", "Docker", "Kubernetes", "Terraform"]},
            {"sector": "FinTech", "growth_pct": 22.0, "demand_level": "high", "key_skills": ["Java", "Microservices", "Blockchain", "Spring"]},
            {"sector": "E-commerce & Digital", "growth_pct": 18.0, "demand_level": "moderate", "key_skills": ["React", "Node.js", "PHP", "Magento"]},
        ],
        "most_demanded_skills": [
            "Python", "SQL", "Docker", "AWS", "React",
            "Machine Learning", "Kubernetes", "Spark", "Terraform", "Power BI",
        ],
        "hiring_hotspots": [
            {"city": "Casablanca", "job_count": 1200, "avg_salary_mad": 240000},
            {"city": "Rabat", "job_count": 650, "avg_salary_mad": 210000},
            {"city": "Tangier", "job_count": 350, "avg_salary_mad": 195000},
            {"city": "Marrakech", "job_count": 200, "avg_salary_mad": 180000},
            {"city": "Remote", "job_count": 500, "avg_salary_mad": 220000},
        ],
        "salary_range_mad": "120,000 - 480,000 MAD/year",
        "market_summary": "Morocco's tech sector is growing rapidly, driven by AI adoption, cloud migration, and a thriving startup ecosystem. Casablanca and Rabat lead in job opportunities, with remote work gaining significant traction post-2024.",
    }
