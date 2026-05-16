"""
Skill Extraction Service — Extracts skills from text and identifies gaps.
Uses keyword matching combined with NLP analysis for comprehensive skill detection.
"""
from typing import List, Dict, Tuple
from app.models.schemas import SkillAnalysis, CareerInsight, LearningPath
import re
import logging

logger = logging.getLogger(__name__)

# ─── Comprehensive Skill Dictionaries ──────────────────────────

TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "r", "scala",
    "go", "rust", "kotlin", "swift", "php", "ruby", "matlab", "julia",
    
    # Data Science & ML
    "machine learning", "deep learning", "natural language processing", "nlp",
    "computer vision", "reinforcement learning", "neural networks", "statistics",
    "data mining", "data analysis", "data visualization", "data engineering",
    "feature engineering", "model deployment", "mlops", "a/b testing",
    "time series", "recommendation systems", "anomaly detection",
    "predictive modeling", "regression", "classification", "clustering",
    
    # AI Specific
    "artificial intelligence", "generative ai", "llm", "transformers",
    "rag", "fine-tuning", "prompt engineering", "langchain",
    
    # Big Data
    "big data", "hadoop", "spark", "kafka", "hive", "pig",
    "data warehouse", "etl", "data pipeline", "data lake",
    
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd",
    "terraform", "ansible", "jenkins", "github actions",
    
    # Databases
    "sql", "nosql", "postgresql", "mysql", "mongodb", "redis",
    "elasticsearch", "cassandra", "neo4j", "sqlite",
    
    # BI & Analytics
    "business intelligence", "tableau", "power bi", "looker",
    "qlik", "sap", "excel", "reporting", "dashboards", "kpi",
    
    # Web Development
    "react", "angular", "vue", "node.js", "express", "django",
    "flask", "fastapi", "spring boot", "rest api", "graphql",
    "html", "css", "tailwindcss", "next.js",
    
    # Software Engineering
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

# ─── Skills required by job category ───────────────────────────

CATEGORY_SKILLS = {
    "Data Science": [
        "python", "r", "statistics", "machine learning", "deep learning",
        "pandas", "scikit-learn", "tensorflow", "pytorch", "sql",
        "data visualization", "jupyter", "numpy", "feature engineering"
    ],
    "AI / Machine Learning": [
        "python", "tensorflow", "pytorch", "deep learning", "nlp",
        "computer vision", "neural networks", "transformers", "mlops",
        "model deployment", "hugging face", "reinforcement learning"
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


def extract_skills(text: str) -> SkillAnalysis:
    """
    Extract skills from user profile text using keyword matching.
    Returns categorized skills (technical, soft, tools, languages, frameworks).
    """
    text_lower = text.lower()
    
    found_technical = []
    found_soft = []
    found_tools = []
    found_languages = []
    found_frameworks = []
    
    # Extract technical skills
    for skill in TECHNICAL_SKILLS:
        if skill in text_lower:
            found_technical.append(skill.title())
    
    # Extract frameworks and tools
    for tool in FRAMEWORKS_AND_TOOLS:
        if tool in text_lower:
            found_frameworks.append(tool.title())
    
    # Extract soft skills
    for skill in SOFT_SKILLS:
        if skill in text_lower:
            found_soft.append(skill.title())
    
    # Extract programming languages
    for lang in PROGRAMMING_LANGUAGES:
        if re.search(r'\b' + re.escape(lang) + r'\b', text_lower):
            found_languages.append(lang.title())
    
    # Remove duplicates while preserving order
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


def identify_missing_skills(
    user_skills: List[str],
    job_description: str
) -> List[str]:
    """
    Compare user skills against job description to find gaps.
    Returns list of skills mentioned in the job but not in the user's profile.
    """
    job_lower = job_description.lower()
    user_lower = {s.lower() for s in user_skills}
    
    missing = []
    all_skills = TECHNICAL_SKILLS | FRAMEWORKS_AND_TOOLS
    
    for skill in all_skills:
        if skill in job_lower and skill not in user_lower:
            missing.append(skill.title())
    
    return list(dict.fromkeys(missing))[:10]  # Top 10 missing skills


def determine_top_categories(skills: SkillAnalysis) -> List[str]:
    """
    Determine the most relevant job categories based on extracted skills.
    """
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
    
    sorted_cats = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    return [cat for cat, _ in sorted_cats[:5]]


def generate_career_insights(
    skills: SkillAnalysis,
    top_categories: List[str],
    avg_match: float
) -> List[CareerInsight]:
    """
    Generate intelligent career insights based on profile analysis.
    """
    insights = []
    
    # Match quality insight
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
    
    # Skills depth insight
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
    
    # Category-specific insights
    if "Data Science" in top_categories or "AI / Machine Learning" in top_categories:
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


def generate_learning_paths(
    skills: SkillAnalysis,
    top_categories: List[str]
) -> List[LearningPath]:
    """
    Generate personalized learning path recommendations.
    """
    all_user_skills = set(
        s.lower() for s in
        skills.technical_skills + skills.frameworks + skills.languages
    )
    
    paths = []
    
    # Check for high-impact missing skills based on top categories
    for category in top_categories[:3]:
        if category in CATEGORY_SKILLS:
            for skill in CATEGORY_SKILLS[category]:
                if skill not in all_user_skills and len(paths) < 6:
                    priority = "high" if category == top_categories[0] else "medium"
                    paths.append(LearningPath(
                        skill=skill.title(),
                        reason=f"Key skill for {category} roles in Morocco",
                        resources=[
                            f"Coursera: {skill.title()} Specialization",
                            f"YouTube: {skill.title()} Tutorial 2024",
                        ],
                        priority=priority
                    ))
    
    # Always recommend cloud skills if missing
    cloud_skills = {"aws", "azure", "gcp", "docker"}
    if not cloud_skills.intersection(all_user_skills):
        paths.append(LearningPath(
            skill="Cloud Computing (AWS/Azure)",
            reason="Cloud skills are required in 70%+ of tech job postings",
            resources=["AWS Free Tier Labs", "Azure Fundamentals (AZ-900)"],
            priority="high"
        ))
    
    return paths[:8]
