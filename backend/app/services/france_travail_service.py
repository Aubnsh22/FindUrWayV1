import httpx
import logging
from typing import List, Dict, Optional
from app.config import get_settings
from app.services.base_source import BaseJobSource

logger = logging.getLogger(__name__)

TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire"
TOKEN_SCOPE = "o2dsoffre api_offresdemploiv2"
API_BASE = "https://api.francetravail.io/partenaire/offresdemploi/v2"

SEARCH_QUERIES = {
    "Data Science": "data scientist",
    "AI / Machine Learning": "ingénieur machine learning",
    "Data Analytics": "data analyst",
    "Business Intelligence": "business intelligence",
    "Software Engineering": "ingénieur logiciel",
    "Data Engineering": "data engineer",
}


class FranceTravailService(BaseJobSource):

    @property
    def source_name(self) -> str:
        return "france_travail"

    async def _get_token(self) -> Optional[str]:
        settings = get_settings()
        if not settings.FRANCE_TRAVAIL_CLIENT_ID:
            logger.info("No France Travail credentials — using demo data")
            return None
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(TOKEN_URL, data={
                    "grant_type": "client_credentials",
                    "client_id": settings.FRANCE_TRAVAIL_CLIENT_ID,
                    "client_secret": settings.FRANCE_TRAVAIL_CLIENT_SECRET,
                    "scope": TOKEN_SCOPE,
                })
                if resp.status_code == 200:
                    return resp.json().get("access_token")
                logger.warning(f"Token error {resp.status_code}: {resp.text[:200]}")
            except Exception as e:
                logger.error(f"France Travail auth failed: {e}")
        return None

    async def fetch_jobs(self, query: str, **kwargs) -> List[Dict]:
        results_per_page = kwargs.get("results_per_page", 20)
        token = await self._get_token()
        if not token:
            return _get_demo_jobs(query)

        all_jobs = []
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.get(
                    f"{API_BASE}/offres/search",
                    params={
                        "motsCles": query,
                        "rayon": 100,
                        "publieeDepuis": 14,
                        "nombreOffres": min(results_per_page, 150),
                    },
                    headers={"Authorization": f"Bearer {token}"},
                )
                if resp.status_code in (200, 206):
                    results = resp.json().get("resultats", [])
                    for job in results:
                        normalized = self._normalize(job)
                        all_jobs.append(normalized)
                else:
                    logger.warning(f"API error {resp.status_code}")
            except Exception as e:
                logger.error(f"France Travail search failed: {e}")

        if not all_jobs:
            return _get_demo_jobs(query)
        return all_jobs

    async def fetch_jobs_multi_category(
        self, categories: List[str], results_per_category: int = 10
    ) -> List[Dict]:
        all_jobs = []
        seen_ids = set()
        for category in categories:
            query = SEARCH_QUERIES.get(category, category)
            jobs = await self.fetch_jobs(query=query, results_per_page=results_per_category)
            for job in jobs:
                if job["job_id"] not in seen_ids:
                    job["category"] = category
                    all_jobs.append(job)
                    seen_ids.add(job["job_id"])
        return all_jobs

    def _normalize(self, job: Dict) -> Dict:
        company_obj = job.get("entreprise", {}) or {}
        lieu = job.get("lieuTravail", {}) or {}
        return {
            "job_id": f"ft_{job.get('id', '')}",
            "title": job.get("intitule", "Untitled"),
            "company": company_obj.get("nom", "Unknown"),
            "location": lieu.get("libelle", "France"),
            "description": _clean_html(job.get("description", "")),
            "salary_min": _parse_salary(job.get("salaire", {})),
            "salary_max": _parse_salary(job.get("salaire", {}), max_=True),
            "url": f"https://candidat.francetravail.fr/offres/recherche/detail/{job.get('id', '')}",
            "source": self.source_name,
        }


def _clean_html(text: str) -> str:
    import re
    text = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()[:2000]


def _parse_salary(salary, max_: bool = False) -> Optional[float]:
    if not salary or not isinstance(salary, dict):
        return None
    libelle = salary.get("libelle", "")
    import re
    nums = re.findall(r'[\d]+(?:[.,]\d+)?', str(libelle))
    if nums:
        idx = 1 if max_ and len(nums) > 1 else 0
        try:
            return float(nums[idx].replace(",", "."))
        except (ValueError, IndexError):
            return None
    return None


def _get_demo_jobs(query: str = "") -> List[Dict]:
    from app.services.adzuna_service import _get_demo_jobs as adzuna_demo
    jobs = adzuna_demo(query)
    for job in jobs:
        job["source"] = "france_travail"
        job["job_id"] = f"ft_demo_{job['job_id']}"
    return jobs
