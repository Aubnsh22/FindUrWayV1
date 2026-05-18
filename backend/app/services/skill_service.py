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
    "qlik", "sap", "excel", "reporting", "kpi",
    "etl", "data warehouse", "data mart", "olap", "ssis", "ssrs",
    "react", "angular", "vue", "node.js", "express", "django",
    "flask", "fastapi", "spring boot", "rest api", "graphql",
    "html", "css", "tailwindcss", "next.js", "shadcn", "zustand", "react query",
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

# ─── Role taxonomy with ecosystem clustering ────────────────────
#
# Each role defines:
#   - keywords:      skills that signal this role
#   - core_skills:   essential skills (high weight)
#   - penalize:      skills that contradict this role
#   - bi_penalize:   BI/analytics skills that STRONGLY penalize
#   - weight_boost:  match multiplier
#   - cluster:       ecosystem cluster (js, python, java, data)
#
# The system detects role by:
#   1. Role keyword/core_skills matching (positive score)
#   2. Ecosystem cluster consistency (cluster bonus)
#   3. Negative weighting for contradicting roles
#   4. BI/analytics penalization for web/engineering roles

ROLES = {
    "javascript_fullstack": {
        "keywords": {"react", "next.js", "node.js", "express", "typescript", "javascript", "full stack", "fullstack", "rest api", "html", "css", "tailwindcss", "frontend", "backend"},
        "core_skills": {"javascript", "typescript", "react", "node.js", "express", "sql", "git", "rest api"},
        "penalize": {"java", "spring boot", "r", "spark", "hadoop"},
        "bi_penalize": {"power bi", "tableau", "business intelligence", "looker", "qlik", "data analyst", "data analysis", "data science", "statistics"},
        "weight_boost": 1.35,
        "cluster": "js",
    },
    "frontend": {
        "keywords": {"react", "angular", "vue", "html", "css", "tailwindcss", "next.js", "frontend", "ui", "ux", "figma"},
        "core_skills": {"javascript", "typescript", "react", "html", "css", "git"},
        "penalize": {"java", "spark", "hadoop", "mlops", "deep learning", "tensorflow", "pytorch", "spring boot", "r"},
        "bi_penalize": {"power bi", "tableau", "business intelligence", "looker", "data analyst", "data science"},
        "weight_boost": 1.25,
        "cluster": "js",
    },
    "backend_node": {
        "keywords": {"node.js", "express", "rest api", "graphql", "backend", "api", "microservices", "postgresql", "mongodb", "redis"},
        "core_skills": {"node.js", "express", "javascript", "sql", "postgresql", "rest api", "git", "docker"},
        "penalize": {"react", "angular", "vue", "html", "css", "tensorflow", "pytorch", "r"},
        "bi_penalize": {"power bi", "tableau", "business intelligence", "looker", "data analyst", "data science"},
        "weight_boost": 1.25,
        "cluster": "js",
    },
    "fullstack": {
        "keywords": {"full stack", "fullstack", "react", "node.js", "typescript", "javascript", "html", "css", "rest api", "next.js"},
        "core_skills": {"javascript", "typescript", "react", "node.js", "sql", "git", "html", "css", "rest api"},
        "penalize": {"java", "tensorflow", "pytorch", "r", "spark", "hadoop"},
        "bi_penalize": {"power bi", "tableau", "business intelligence", "looker", "data analyst", "data science", "etl", "data warehouse"},
        "weight_boost": 1.3,
        "cluster": "js",
    },
    "cloud_devops": {
        "keywords": {"docker", "kubernetes", "ci/cd", "terraform", "ansible", "jenkins", "github actions", "devops", "cloud", "aws", "azure", "gcp"},
        "core_skills": {"docker", "kubernetes", "aws", "azure", "gcp", "linux", "git", "ci/cd"},
        "penalize": {"react", "angular", "vue", "tensorflow", "pytorch", "r"},
        "bi_penalize": {"power bi", "tableau", "data analyst"},
        "weight_boost": 1.2,
        "cluster": "devops",
    },
    "aiml": {
        "keywords": {"machine learning", "deep learning", "nlp", "computer vision", "artificial intelligence", "tensorflow", "pytorch", "neural networks", "mlops", "generative ai", "llm"},
        "core_skills": {"python", "machine learning", "deep learning", "tensorflow", "pytorch", "statistics", "nlp"},
        "penalize": {"react", "angular", "vue", "html", "css", "spring boot", "php", "ruby", "express"},
        "bi_penalize": {"power bi", "tableau"},
        "weight_boost": 1.3,
        "cluster": "data",
    },
    "dataengineering": {
        "keywords": {"spark", "kafka", "airflow", "data pipeline", "etl", "data warehouse", "data lake", "hadoop", "data engineering", "dbt"},
        "core_skills": {"python", "sql", "spark", "airflow", "docker", "aws", "kafka"},
        "penalize": {"react", "angular", "vue", "html", "css", "tensorflow", "pytorch"},
        "bi_penalize": {},
        "weight_boost": 1.2,
        "cluster": "data",
    },
    "devops": {
        "keywords": {"docker", "kubernetes", "ci/cd", "terraform", "ansible", "jenkins", "github actions", "devops", "cloud"},
        "core_skills": {"docker", "kubernetes", "aws", "azure", "gcp", "linux", "git", "ci/cd"},
        "penalize": {"react", "angular", "vue", "tensorflow", "pytorch", "r"},
        "bi_penalize": {"power bi", "tableau"},
        "weight_boost": 1.2,
        "cluster": "devops",
    },
    "mobile": {
        "keywords": {"swift", "kotlin", "android", "ios", "react native", "flutter", "mobile", "expo"},
        "core_skills": {"kotlin", "swift", "java", "javascript", "react"},
        "penalize": {"spark", "hadoop", "tensorflow", "pytorch", "mlops", "spring boot"},
        "bi_penalize": {"power bi", "tableau", "business intelligence"},
        "weight_boost": 1.3,
        "cluster": "mobile",
    },
    "datascience": {
        "keywords": {"data science", "statistics", "data analysis", "data visualization", "machine learning", "python", "r", "sql"},
        "core_skills": {"python", "sql", "statistics", "machine learning", "pandas", "scikit-learn"},
        "penalize": {"react", "angular", "vue", "spring boot", "html", "css", "express"},
        "bi_penalize": {},
        "weight_boost": 1.2,
        "cluster": "data",
    },
}

# ─── JS ecosystem skills — if these are present without BI skills → block BI/DA roles ───
JS_ECOSYSTEM = {"react", "next.js", "node.js", "express", "typescript", "javascript", "rest api", "html", "css"}
BI_SKILLS = {"power bi", "tableau", "looker", "business intelligence", "etl", "data warehouse", "data analyst", "qlik"}
ANALYTICS_SKILLS = {"statistics", "data analysis", "data science", "spss", "sas", "excel", "reporting", "kpi"}

# ─── Role → job category mapping ───
ROLE_CATEGORY_MAP = {
    "javascript_fullstack": "Software Engineering",
    "frontend": "Software Engineering",
    "backend_node": "Software Engineering",
    "fullstack": "Software Engineering",
    "cloud_devops": "Software Engineering",
    "mobile": "Software Engineering",
    "aiml": "AI / Machine Learning",
    "dataengineering": "Data Engineering",
    "devops": "Software Engineering",
    "datascience": "Data Science",
}

# ─── Category disqualification: if role cluster is "js" and no BI skills, kill these categories ───
BI_ANALYTICS_CATEGORIES = {"Business Intelligence", "Data Analytics", "Data Science"}
AI_ML_CATEGORY = "AI / Machine Learning"

# ─── Technology Domains for Stack Compatibility ──────────────────
#
# Each domain defines:
#   - signature_skills: skills uniquely identifying this domain
#   - adjacent_domains: domains that share a natural boundary (e.g. web + devops)
#   - incompatible_domains: domains that fundamentally differ
#
# Stack compatibility: two jobs in the same domain can match strongly.
# Adjacent domains → moderate compatibility (~0.55-0.65).
# Unrelated domains → weak compatibility (~0.3).
# Incompatible domains → severe penalty (~0.12).

TECHNOLOGY_DOMAINS = {
    "modern_web": {
        "name": "Modern Web Development",
        "signature_skills": {
            "react", "next.js", "node.js", "express", "vue", "angular",
            "typescript", "rest api", "graphql", "tailwindcss",
            "shadcn", "zustand", "react query", "html", "css",
            "postgresql", "mongodb", "redis",
        },
        "adjacent_domains": ["devops_cloud", "mobile"],
        "incompatible_domains": ["enterprise_erp", "ecommerce_platform", "infrastructure_ops"],
    },
    "enterprise_erp": {
        "name": "Enterprise ERP / Integration",
        "signature_skills": {
            "sap", "oracle", "abap", "siebel", "peoplesoft",
            "erp", "crm", "sap hana", "sap fiori", "sap abap",
            "sap sd", "sap mm", "sap fi", "edi", "integration",
            "sap bi", "sap bw", "sap successfactors", "sap s/4hana",
        },
        "adjacent_domains": [],
        "incompatible_domains": ["modern_web", "mobile", "data_ml", "devops_cloud"],
    },
    "ecommerce_platform": {
        "name": "E-commerce Platform",
        "signature_skills": {
            "magento", "shopify", "woocommerce", "adobe commerce",
            "bigcommerce", "php", "soap", "magento 2", "shopify plus",
            "liquid", "commerce cloud", "salesforce commerce",
        },
        "adjacent_domains": ["modern_web"],
        "incompatible_domains": ["enterprise_erp", "infrastructure_ops"],
    },
    "infrastructure_ops": {
        "name": "Infrastructure & Operations",
        "signature_skills": {
            "data center", "networking", "systems administration",
            "network security", "noc", "server", "cisco", "unix",
            "storage", "backup", "disaster recovery", "sla", "itil",
            "active directory", "ldap", "vpn", "firewall",
            "load balancing", "dns", "dhcp", "tcp/ip",
            "switching", "routing", "ops", "operations",
        },
        "adjacent_domains": ["devops_cloud"],
        "incompatible_domains": ["modern_web", "enterprise_erp", "ecommerce_platform", "mobile"],
    },
    "devops_cloud": {
        "name": "DevOps & Cloud Infrastructure",
        "signature_skills": {
            "docker", "kubernetes", "terraform", "ci/cd", "jenkins",
            "github actions", "ansible", "prometheus", "grafana",
            "helm", "cloud", "aws", "azure", "gcp", "gitlab ci",
            "circleci", "argocd", "pulumi", "cloudformation",
            "monitoring", "observability",
        },
        "adjacent_domains": ["modern_web", "infrastructure_ops", "data_ml"],
        "incompatible_domains": ["enterprise_erp", "ecommerce_platform"],
    },
    "mobile": {
        "name": "Mobile Development",
        "signature_skills": {
            "swift", "kotlin", "android", "ios", "react native",
            "flutter", "expo", "dart", "xcode", "app store",
            "google play", "uikit", "swiftui", "jetpack compose",
            "mobile", "ipad", "tablet",
        },
        "adjacent_domains": ["modern_web"],
        "incompatible_domains": ["enterprise_erp", "infrastructure_ops"],
    },
    "data_ml": {
        "name": "Data & Machine Learning",
        "signature_skills": {
            "spark", "tensorflow", "pytorch", "machine learning",
            "deep learning", "nlp", "statistics", "airflow", "mlflow",
            "pandas", "numpy", "scikit-learn", "jupyter",
            "data pipeline", "etl", "data warehouse", "data lake",
            "kafka", "hadoop", "hive", "dbt", "snowflake",
            "databricks", "feature engineering", "model deployment",
            "transformers", "llm", "rag", "langchain",
        },
        "adjacent_domains": ["devops_cloud", "modern_web"],
        "incompatible_domains": ["enterprise_erp", "infrastructure_ops", "ecommerce_platform"],
    },
}

# Skills common to ALL engineering roles — should not drive differentiation
GENERIC_ENGINEERING_SKILLS = {
    "git", "agile", "scrum", "testing", "unit testing",
    "problem solving", "communication", "teamwork",
    "design patterns", "clean code", "api design", "oop",
    "linux", "bash", "shell", "jira", "confluence",
    "documentation", "debugging", "code review",
}

# Seniority and role-type signals for experience context
SENIORITY_SIGNALS = {
    "leadership": {"leadership", "manager", "head of", "director", "vp", "vice president", "chief", "cto", "lead", "principal", "team lead", "engineering manager", "senior manager"},
    "senior_ic": {"senior", "staff", "architect", "tech lead"},
    "mid": {"mid-level", "mid level", "intermediate"},
    "junior": {"junior", "entry", "graduate", "associate", "trainee"},
}

ROLE_TYPE_SIGNALS = {
    "operations": {"operations", "data center", "infrastructure", "systems admin", "network", "noc", "site reliability", "sre", "sysadmin"},
    "management": {"manager", "director", "head", "leadership", "management", "vp"},
    "engineering": {"engineer", "developer", "programmer", "software", "engineering", "backend", "frontend", "full stack", "fullstack", "architect", "coding", "programming"},
}

# ─── Aspiration Detection ──────────────────────────────────────
# Signal words that indicate a user is learning or aspiring toward a domain
ASPIRATION_SIGNALS = {
    "learning", "studying", "exploring", "interested in",
    "currently learning", "getting into", "picking up",
    "expanding into", "building skills in", "familiarizing",
}
ASPIRATION_DOMAIN_MAP = {
    "docker": "devops_cloud", "kubernetes": "devops_cloud",
    "ci/cd": "devops_cloud", "aws": "devops_cloud",
    "azure": "devops_cloud", "gcp": "devops_cloud",
    "terraform": "devops_cloud", "ansible": "devops_cloud",
    "machine learning": "data_ml", "deep learning": "data_ml",
    "react native": "mobile", "flutter": "mobile",
    "swift": "mobile", "kotlin": "mobile",
}


def detect_aspirations(profile_text: str) -> List[str]:
    """Detect technology domains the user is learning or aspiring toward."""
    text_lower = profile_text.lower()
    has_signal = any(signal in text_lower for signal in ASPIRATION_SIGNALS)
    if not has_signal:
        return []

    aspirations = set()
    for tech, domain in ASPIRATION_DOMAIN_MAP.items():
        if tech in text_lower:
            aspirations.add(domain)

    # Check for signal phrases near tech keywords
    for signal in ASPIRATION_SIGNALS:
        idx = text_lower.find(signal)
        if idx >= 0:
            window = text_lower[idx: idx + 150]
            for tech, domain in ASPIRATION_DOMAIN_MAP.items():
                if tech in window:
                    aspirations.add(domain)

    return list(aspirations)


def detect_user_domain(skills: SkillAnalysis) -> str:
    """Detect the user's primary technology domain based on extracted skills."""
    all_user_skills = set(
        _normalize_tech_names(s.lower()) for s in (
            skills.technical_skills + skills.frameworks +
            skills.tools + skills.languages
        )
    )

    domain_scores = {}
    for domain_key, domain_def in TECHNOLOGY_DOMAINS.items():
        score = sum(1 for s in domain_def["signature_skills"] if s in all_user_skills)
        if score > 0:
            domain_scores[domain_key] = score

    if not domain_scores:
        # Fall back: count any engineering-domain overlap broadly
        return "modern_web"

    # Return the domain with the most matching signature skills
    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_domains[0][0]


def _normalize_tech_names(text: str) -> str:
    """Normalize common tech name variations for consistent matching."""
    text = text.replace("node js", "node.js")
    text = text.replace("nodejs", "node.js")
    text = text.replace("react js", "react.js")
    text = text.replace("reactjs", "react.js")
    return text


def detect_job_domain(job: Dict) -> str:
    """Detect the job's technology domain from its title and description.
    Title matches are weighted 3x higher than description matches."""
    title = _normalize_tech_names((job.get("title") or "").lower())
    description = _normalize_tech_names((job.get("description") or "").lower())
    category = (job.get("category") or "").lower()

    domain_scores = {}
    for domain_key, domain_def in TECHNOLOGY_DOMAINS.items():
        title_score = sum(3 for s in domain_def["signature_skills"] if s in title)
        desc_score = sum(1 for s in domain_def["signature_skills"] if s in description)
        cat_score = sum(1 for s in domain_def["signature_skills"] if s in category)
        total = title_score + desc_score + cat_score
        if total > 0:
            domain_scores[domain_key] = total

    if not domain_scores:
        return "modern_web"

    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_domains[0][0]


def get_domain_compatibility(user_domain: str, job_domain: str) -> float:
    """Return a compatibility factor between two domains (0.0 - 1.0)."""
    if user_domain == job_domain:
        return 1.0

    domain_def = TECHNOLOGY_DOMAINS.get(user_domain)
    if not domain_def:
        return 0.5

    if job_domain in domain_def.get("incompatible_domains", set()):
        return 0.12

    if job_domain in domain_def.get("adjacent_domains", set()):
        return 0.6

    # Neither adjacent nor incompatible → unrelated
    return 0.3


def detect_seniority_level(text: str) -> str:
    """Detect seniority level from profile or job text."""
    text_lower = text.lower()
    for level in ("leadership", "senior_ic", "mid", "junior"):
        for signal in SENIORITY_SIGNALS.get(level, set()):
            if signal in text_lower:
                return level
    return "mid"


def detect_role_type(text: str) -> str:
    """Detect whether text describes engineering, operations, or management."""
    text_lower = text.lower()
    scores = {}
    for rtype, signals in ROLE_TYPE_SIGNALS.items():
        scores[rtype] = sum(1 for s in signals if s in text_lower)
    if not scores or all(v == 0 for v in scores.values()):
        return "engineering"
    return max(scores, key=scores.get)


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
        "data visualization", "statistics", "reporting",
        "a/b testing", "kpi", "data analysis"
    ],
    "Business Intelligence": [
        "sql", "power bi", "tableau", "excel", "reporting",
        "etl", "data warehouse", "sap", "kpi",
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
    Detect the user's most likely career role using ecosystem clustering,
    negative weighting, and contextual understanding.
    Returns (primary_role, secondary_role, confidence).
    """
    all_skills = set(
        s.lower() for s in (
            skills.technical_skills + skills.frameworks +
            skills.tools + skills.languages
        )
    )

    # Detect JS ecosystem strength
    js_signals = sum(1 for s in JS_ECOSYSTEM if s in all_skills)
    bi_signals = sum(1 for s in BI_SKILLS if s in all_skills)
    analytics_signals = sum(1 for s in ANALYTICS_SKILLS if s in all_skills)

    role_scores = {}
    for role_name, role_def in ROLES.items():
        score = 0

        # Positive matching
        for skill in all_skills:
            if skill in role_def["keywords"]:
                score += 2
            if skill in role_def["core_skills"]:
                score += 3

        # Penalize contradicting skills
        for skill in all_skills:
            if skill in role_def.get("penalize", set()):
                score -= 1

        # BI/analytics penalty for engineering roles
        if role_def.get("cluster") in ("js", "mobile", "devops"):
            for skill in all_skills:
                if skill in role_def.get("bi_penalize", set()):
                    score -= 3  # Strong penalty for mismatched BI skills

        # Cluster consistency bonus: if user has strong JS signals, boost JS cluster roles
        if role_def.get("cluster") == "js" and js_signals >= 3:
            score += 2
        if role_def.get("cluster") == "data" and (bi_signals + analytics_signals) >= 3:
            score += 2

        role_scores[role_name] = score

    sorted_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)
    primary = sorted_roles[0][0] if sorted_roles else "fullstack"
    secondary = sorted_roles[1][0] if len(sorted_roles) > 1 else primary
    max_score = sorted_roles[0][1] if sorted_roles else 1
    total = sum(s for _, s in sorted_roles) or 1
    confidence = min(max_score / total * 2, 1.0) if max_score > 0 else 0.3

    return primary, secondary, confidence


def get_role_boost(user_role: str, job: Dict) -> float:
    """Return match multiplier based on how well a job aligns with the user's role.
    Higher boost (1.0+) for aligned roles, strong penalty (0.3-0.5) for mismatched BI/analytics roles
    when user is an engineer."""
    role_def = ROLES.get(user_role)
    if not role_def:
        return 1.0

    job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('category', '')}".lower()
    job_category = (job.get("category") or "").lower()

    boost = role_def.get("weight_boost", 1.0)

    # Penalize for contradicting skills in job
    for skill in role_def.get("penalize", set()):
        if skill in job_text:
            boost = max(0.3, boost - 0.3)

    # Strong BI/analytics penalty for engineering cluster users
    user_cluster = role_def.get("cluster")
    if user_cluster in ("js", "mobile", "devops"):
        # If the job is clearly a BI/analytics category, heavily penalize
        if any(bi_cat in job_category for bi_cat in ("business intelligence", "data analytics", "data science")):
            boost = min(boost, 0.4)
        # Check for BI skills in the job
        for skill in role_def.get("bi_penalize", set()):
            if skill in job_text:
                boost = max(0.2, boost - 0.4)

    return boost


ROLE_SPECIFIC_LEARNING = {
    "javascript_fullstack": [
        ("TypeScript", 14, "Type safety across your full-stack JavaScript apps", "high"),
        ("GraphQL", 11, "Modern API query language — strongly complements REST", "high"),
        ("Kubernetes", 11, "Container orchestration for production deployments", "high"),
        ("Testing (Jest/Cypress)", 10, "End-to-end testing for reliable web apps", "high"),
        ("Redis", 9, "Caching and session management for Node.js backends", "medium"),
        ("Microservices Architecture", 10, "Scale your full-stack apps with service decomposition", "high"),
        ("System Design", 11, "Architect scalable web applications", "high"),
        ("Terraform", 9, "Infrastructure as code for cloud deployments", "medium"),
    ],
    "frontend": [
        ("TypeScript", 14, "Type safety and modern JS features for frontend roles", "high"),
        ("Next.js", 12, "React meta-framework for production apps", "high"),
        ("Testing (Jest/Cypress)", 11, "Frontend testing for reliable UIs", "high"),
        ("GraphQL", 9, "Modern data fetching for frontend apps", "medium"),
        ("System Design", 10, "Architect scalable frontend applications", "high"),
    ],
    "backend_node": [
        ("TypeScript", 12, "Type-safe Node.js backend development", "high"),
        ("PostgreSQL", 11, "Advanced relational database for backend services", "high"),
        ("Docker", 11, "Containerization for backend deployment", "high"),
        ("Redis", 9, "Caching and message queues for Node.js", "medium"),
        ("GraphQL", 10, "Modern API query language", "high"),
        ("Microservices", 11, "Scalable backend architecture", "high"),
        ("Kubernetes", 10, "Container orchestration for backend services", "high"),
    ],
    "fullstack": [
        ("TypeScript", 14, "Type safety across frontend and backend", "high"),
        ("GraphQL", 11, "Modern API query language", "high"),
        ("Docker", 11, "Containerization for full-stack deployment", "high"),
        ("Kubernetes", 11, "Container orchestration for production apps", "high"),
        ("Testing (Jest/Cypress)", 10, "Full-stack testing for reliable apps", "high"),
        ("Microservices Architecture", 10, "Scalable full-stack application design", "high"),
        ("System Design", 11, "Architect scalable web applications", "high"),
        ("Redis", 9, "Caching for full-stack applications", "medium"),
    ],
    "cloud_devops": [
        ("Kubernetes", 14, "Container orchestration at scale", "high"),
        ("Terraform", 12, "Infrastructure as code", "high"),
        ("CI/CD Pipelines", 11, "Automated deployment pipelines", "high"),
        ("Monitoring (Grafana/Prometheus)", 10, "System observability", "high"),
        ("AWS/Azure Certifications", 11, "Cloud platform expertise", "high"),
        ("Helm", 9, "Kubernetes package management", "medium"),
    ],
    "aiml": [
        ("MLOps", 13, "ML model deployment and monitoring", "high"),
        ("Docker", 10, "Containerization for ML models", "high"),
        ("Spark", 11, "Big data processing for ML pipelines", "high"),
        ("Cloud (AWS/GCP)", 11, "Cloud ML services and deployment", "high"),
        ("Kubernetes", 10, "Orchestration for ML workloads", "medium"),
        ("LLM Fine-tuning", 12, "Specialize large language models for custom use cases", "high"),
    ],
    "dataengineering": [
        ("Airflow", 11, "Pipeline orchestration", "high"),
        ("Spark", 12, "Distributed data processing", "high"),
        ("Kafka", 10, "Stream processing", "high"),
        ("dbt", 9, "Data transformation", "medium"),
        ("Snowflake", 9, "Cloud data warehousing", "medium"),
        ("Kubernetes", 10, "Data pipeline orchestration at scale", "high"),
    ],
    "devops": [
        ("Kubernetes", 14, "Container orchestration at scale", "high"),
        ("Terraform", 12, "Infrastructure as code", "high"),
        ("CI/CD Pipelines", 11, "Automated deployment pipelines", "high"),
        ("Monitoring (Grafana/Prometheus)", 10, "System observability", "high"),
        ("AWS/Azure Certifications", 11, "Cloud platform expertise", "high"),
    ],
    "mobile": [
        ("React Native", 12, "Cross-platform mobile development", "high"),
        ("Flutter", 10, "Dart-based mobile framework", "high"),
        ("Firebase", 9, "Backend services for mobile apps", "medium"),
        ("App Store Deployment", 8, "iOS/Android deployment process", "medium"),
        ("TypeScript", 10, "Type-safe mobile development", "high"),
    ],
    "datascience": [
        ("MLOps", 12, "Production ML model deployment", "high"),
        ("Spark", 10, "Big data processing", "high"),
        ("Statistics", 10, "Advanced statistical methods for data analysis", "high"),
        ("SQL Window Functions", 9, "Advanced data analysis", "medium"),
        ("Docker", 9, "Reproducible analysis environments", "medium"),
        ("Cloud (AWS/GCP)", 10, "Cloud-based data science at scale", "high"),
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

    # Detect JS ecosystem strength and BI signals
    js_signals = sum(1 for s in JS_ECOSYSTEM if s in all_user_skills)
    bi_signals = sum(1 for s in BI_SKILLS if s in all_user_skills)

    is_js_dev = js_signals >= 2
    has_explicit_bi = bi_signals >= 2

    role, _, _ = detect_career_role(skills)

    category_scores = {}
    for category, required_skills in CATEGORY_SKILLS.items():
        overlap = sum(1 for s in required_skills if s in all_user_skills)
        if overlap > 0:
            score = overlap / len(required_skills)
            category_scores[category] = score

    # Smart filtering: JS devs without BI skills should NEVER match BI/DA/DS
    if is_js_dev and not has_explicit_bi:
        for cat in BI_ANALYTICS_CATEGORIES:
            category_scores.pop(cat, None)
        category_scores.pop(AI_ML_CATEGORY, None)

    # Boost the preferred category for the detected role
    preferred_cat = ROLE_CATEGORY_MAP.get(role)
    if preferred_cat and preferred_cat in category_scores:
        category_scores[preferred_cat] = max(
            category_scores.get(preferred_cat, 0), 0.5
        )

    # If all categories were filtered out, ensure at least Software Engineering
    if not category_scores:
        category_scores["Software Engineering"] = 0.6

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
        role, _, _ = detect_career_role(skills)
        if ROLE_CATEGORY_MAP.get(role) not in ("Software Engineering",):
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
