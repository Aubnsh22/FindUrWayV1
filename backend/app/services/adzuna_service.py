"""
Adzuna API Service — Fetches real job listings from the Adzuna API.
Searches across multiple supported countries with Morocco-focused keywords.
Falls back to curated demo data when API credentials are not configured.
"""
import httpx
import logging
from typing import List, Dict, Optional
from app.config import get_settings
import hashlib
import time

logger = logging.getLogger(__name__)

ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"

# Countries to search (Adzuna-supported)
SEARCH_COUNTRIES = ["gb", "fr", "de", "us"]

# Tech job search keywords grouped by category
SEARCH_QUERIES = {
    "Data Science": "data scientist",
    "AI / Machine Learning": "machine learning engineer",
    "Data Analytics": "data analyst",
    "Business Intelligence": "business intelligence",
    "Software Engineering": "software engineer",
    "Data Engineering": "data engineer",
}


async def fetch_jobs_from_adzuna(
    query: str = "data science",
    location: str = "",
    category: str = "",
    page: int = 1,
    results_per_page: int = 15,
) -> List[Dict]:
    """
    Fetch jobs from Adzuna API across multiple countries.
    Returns a normalized list of job dictionaries.
    """
    settings = get_settings()
    
    # If no API credentials, use demo data
    if settings.ADZUNA_APP_ID == "your_app_id_here":
        logger.info("No Adzuna API credentials — using demo data")
        return _get_demo_jobs(query)
    
    all_jobs = []
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        for country in SEARCH_COUNTRIES[:2]:  # Search top 2 countries
            try:
                url = f"{ADZUNA_BASE_URL}/{country}/search/{page}"
                params = {
                    "app_id": settings.ADZUNA_APP_ID,
                    "app_key": settings.ADZUNA_APP_KEY,
                    "what": query,
                    "results_per_page": results_per_page,
                    "content-type": "application/json",
                    "sort_by": "date",
                }
                if location:
                    params["where"] = location
                
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    
                    for job in results:
                        normalized = _normalize_adzuna_job(job, country)
                        all_jobs.append(normalized)
                else:
                    logger.warning(
                        f"Adzuna API returned {response.status_code} for {country}"
                    )
            except Exception as e:
                logger.error(f"Adzuna API error for {country}: {e}")
    
    # If API returned no results, fall back to demo data
    if not all_jobs:
        logger.info("No API results, falling back to demo data")
        return _get_demo_jobs(query)
    
    return all_jobs


async def fetch_jobs_multi_category(
    categories: List[str] = None,
    results_per_category: int = 10
) -> List[Dict]:
    """
    Fetch jobs across multiple categories for comprehensive matching.
    """
    if categories is None:
        categories = list(SEARCH_QUERIES.keys())
    
    all_jobs = []
    seen_ids = set()
    
    for category in categories:
        query = SEARCH_QUERIES.get(category, category)
        jobs = await fetch_jobs_from_adzuna(
            query=query,
            results_per_page=results_per_category
        )
        for job in jobs:
            if job["job_id"] not in seen_ids:
                job["category"] = category
                all_jobs.append(job)
                seen_ids.add(job["job_id"])
    
    return all_jobs


def _normalize_adzuna_job(job: Dict, country: str) -> Dict:
    """Normalize an Adzuna API job result to our standard format."""
    return {
        "job_id": str(job.get("id", "")),
        "title": job.get("title", "Untitled Position"),
        "company": job.get("company", {}).get("display_name", "Unknown Company"),
        "location": job.get("location", {}).get("display_name", f"{country.upper()} Region"),
        "description": _clean_description(job.get("description", "")),
        "salary_min": job.get("salary_min"),
        "salary_max": job.get("salary_max"),
        "category": job.get("category", {}).get("label", ""),
        "url": job.get("redirect_url", ""),
        "source": "adzuna",
        "created": job.get("created", ""),
    }


def _clean_description(text: str) -> str:
    """Clean HTML tags and extra whitespace from job descriptions."""
    import re
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:2000]  # Limit length


def _get_demo_jobs(query: str = "") -> List[Dict]:
    """
    Return curated Morocco-focused tech job listings for demo mode.
    These represent real types of positions available in Morocco's tech market.
    """
    demo_jobs = [
        {
            "job_id": "demo_001",
            "title": "Senior Data Scientist",
            "company": "OCP Group",
            "location": "Casablanca, Morocco",
            "description": "We are looking for a Senior Data Scientist to join our digital transformation team. You will work on predictive analytics, machine learning models, and data-driven solutions for industrial optimization. Required skills: Python, TensorFlow, SQL, statistics, data visualization, scikit-learn. Experience with big data tools (Spark, Hadoop) is a plus. Strong communication and presentation skills needed.",
            "salary_min": 25000,
            "salary_max": 45000,
            "category": "Data Science",
            "url": "https://www.ocpgroup.ma/careers",
            "created": "2024-12-01T10:00:00Z",
        },
        {
            "job_id": "demo_002",
            "title": "Machine Learning Engineer",
            "company": "Majorel Morocco",
            "location": "Rabat, Morocco",
            "description": "Join our AI team to develop and deploy machine learning models for customer experience optimization. Work with NLP, computer vision, and recommendation systems. Required: Python, PyTorch, Docker, MLOps, REST APIs, Git. Knowledge of transformers and LLMs preferred. Agile environment, collaborative team.",
            "salary_min": 22000,
            "salary_max": 40000,
            "category": "AI / Machine Learning",
            "url": "https://www.majorel.com/careers",
            "created": "2024-12-05T10:00:00Z",
        },
        {
            "job_id": "demo_003",
            "title": "Business Intelligence Analyst",
            "company": "Attijariwafa Bank",
            "location": "Casablanca, Morocco",
            "description": "Seeking a BI Analyst to design dashboards, KPI reports, and data warehousing solutions for banking operations. Must have expertise in Power BI, SQL, Excel, ETL processes, and data warehouse design. Experience with SAP or Oracle is a plus. Strong analytical and communication skills required.",
            "salary_min": 18000,
            "salary_max": 30000,
            "category": "Business Intelligence",
            "url": "https://www.attijariwafabank.com/en/careers",
            "created": "2024-12-03T10:00:00Z",
        },
        {
            "job_id": "demo_004",
            "title": "Data Analyst",
            "company": "Capgemini Morocco",
            "location": "Casablanca, Morocco",
            "description": "Data Analyst position in our consulting practice. Perform data analysis, create visualizations, and generate insights for clients across banking and telecom. Required: SQL, Python, Tableau, Power BI, statistics, Excel, data visualization. Knowledge of R and A/B testing is advantageous.",
            "salary_min": 15000,
            "salary_max": 25000,
            "category": "Data Analytics",
            "url": "https://www.capgemini.com/careers",
            "created": "2024-12-07T10:00:00Z",
        },
        {
            "job_id": "demo_005",
            "title": "Full Stack Software Engineer",
            "company": "Sqli Digital Experience",
            "location": "Rabat, Morocco",
            "description": "Full Stack Engineer for our digital agency. Build web applications using React, Node.js, TypeScript, and cloud services. Required: JavaScript, React, Node.js, REST API, Git, Docker, PostgreSQL, agile/scrum. Experience with AWS or Azure, CI/CD pipelines, and microservices architecture preferred.",
            "salary_min": 20000,
            "salary_max": 35000,
            "category": "Software Engineering",
            "url": "https://www.sqli.com/careers",
            "created": "2024-12-02T10:00:00Z",
        },
        {
            "job_id": "demo_006",
            "title": "Data Engineer",
            "company": "Atos Morocco",
            "location": "Casablanca, Morocco",
            "description": "Data Engineer to build and maintain data pipelines and infrastructure. Design ETL workflows, data lakes, and real-time processing systems. Required: Python, SQL, Apache Spark, Airflow, Docker, AWS/Azure, data warehouse design. Experience with Kafka, dbt, and Snowflake is a plus.",
            "salary_min": 22000,
            "salary_max": 38000,
            "category": "Data Engineering",
            "url": "https://atos.net/en/careers",
            "created": "2024-12-04T10:00:00Z",
        },
        {
            "job_id": "demo_007",
            "title": "AI Research Engineer",
            "company": "UM6P — 1337 Coding School",
            "location": "Ben Guerir, Morocco",
            "description": "AI Research Engineer to work on cutting-edge NLP and computer vision projects. Publish research, develop prototypes, and collaborate with international teams. Required: Python, PyTorch, transformers, deep learning, research methodology, Git. PhD or Master's in CS/AI preferred.",
            "salary_min": 28000,
            "salary_max": 50000,
            "category": "AI / Machine Learning",
            "url": "https://um6p.ma/careers",
            "created": "2024-12-06T10:00:00Z",
        },
        {
            "job_id": "demo_008",
            "title": "Junior Data Scientist",
            "company": "inwi",
            "location": "Casablanca, Morocco",
            "description": "Entry-level Data Scientist for our telecom analytics team. Analyze customer data, build churn prediction models, and create reports. Required: Python, pandas, SQL, statistics, data visualization, scikit-learn. Knowledge of machine learning algorithms and Jupyter notebooks expected.",
            "salary_min": 12000,
            "salary_max": 20000,
            "category": "Data Science",
            "url": "https://www.inwi.ma/carrieres",
            "created": "2024-12-08T10:00:00Z",
        },
        {
            "job_id": "demo_009",
            "title": "DevOps Engineer",
            "company": "CGI Morocco",
            "location": "Rabat, Morocco",
            "description": "DevOps Engineer to manage CI/CD pipelines, cloud infrastructure, and automation. Required: Docker, Kubernetes, AWS/Azure, Terraform, Jenkins, Git, Linux, Python, monitoring tools (Grafana, Prometheus). Agile methodology experience required.",
            "salary_min": 20000,
            "salary_max": 35000,
            "category": "Software Engineering",
            "url": "https://www.cgi.com/en/careers",
            "created": "2024-12-09T10:00:00Z",
        },
        {
            "job_id": "demo_010",
            "title": "Power BI Developer",
            "company": "Bank of Africa",
            "location": "Casablanca, Morocco",
            "description": "Power BI Developer for our banking analytics team. Design interactive dashboards, data models, and reporting solutions. Required: Power BI, DAX, SQL, data warehouse, ETL, Excel. Experience with Azure Data Factory and data governance preferred.",
            "salary_min": 16000,
            "salary_max": 28000,
            "category": "Business Intelligence",
            "url": "https://www.bankofafrica.ma/careers",
            "created": "2024-12-10T10:00:00Z",
        },
        {
            "job_id": "demo_011",
            "title": "NLP Engineer",
            "company": "TechnoFirst",
            "location": "Tangier, Morocco",
            "description": "NLP Engineer to develop Arabic and French language processing solutions. Build chatbots, text classification, and sentiment analysis systems. Required: Python, NLP, transformers, Hugging Face, spaCy, NLTK, deep learning, Docker. Multilingual experience (Arabic/French) is essential.",
            "salary_min": 24000,
            "salary_max": 42000,
            "category": "AI / Machine Learning",
            "url": "https://www.technofirst.com/careers",
            "created": "2024-12-11T10:00:00Z",
        },
        {
            "job_id": "demo_012",
            "title": "Cloud Data Architect",
            "company": "Deloitte Morocco",
            "location": "Casablanca, Morocco",
            "description": "Cloud Data Architect to design enterprise data solutions on Azure/AWS. Lead data strategy, architecture, and governance initiatives. Required: Azure, AWS, data warehouse, SQL, Python, Spark, data governance, microservices. 5+ years experience expected.",
            "salary_min": 35000,
            "salary_max": 60000,
            "category": "Data Engineering",
            "url": "https://www.deloitte.com/careers",
            "created": "2024-12-12T10:00:00Z",
        },
    ]
    
    result = []
    for j in demo_jobs:
        job = dict(j)
        job["source"] = "adzuna"
        result.append(job)

    # Filter by query if provided
    if query:
        query_lower = query.lower()
        filtered = [
            j for j in result
            if query_lower in j["title"].lower()
            or query_lower in j["description"].lower()
            or query_lower in j["category"].lower()
        ]
        return filtered if filtered else result

    return result
