import logging
from typing import List, Dict
from app.services.base_source import BaseJobSource

logger = logging.getLogger(__name__)

SEARCH_QUERIES = {
    "Data Science": "data scientist",
    "AI / Machine Learning": "machine learning engineer",
    "Data Analytics": "data analyst",
    "Business Intelligence": "business intelligence",
    "Software Engineering": "software engineer",
    "Data Engineering": "data engineer",
}


class AdzunaSource(BaseJobSource):

    @property
    def source_name(self) -> str:
        return "adzuna"

    async def fetch_jobs(self, query: str, **kwargs) -> List[Dict]:
        from app.services.adzuna_service import fetch_jobs_from_adzuna
        results_per_page = kwargs.get("results_per_page", 20)
        return await fetch_jobs_from_adzuna(query=query, results_per_page=results_per_page)

    async def fetch_jobs_multi_category(
        self, categories: List[str], results_per_category: int = 10
    ) -> List[Dict]:
        from app.services.adzuna_service import fetch_jobs_multi_category
        return await fetch_jobs_multi_category(
            categories=categories,
            results_per_category=results_per_category,
        )
