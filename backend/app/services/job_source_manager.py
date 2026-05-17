import asyncio
import logging
from typing import List, Dict, Optional
from app.services.base_source import BaseJobSource
from app.services.adzuna_source import AdzunaSource
from app.services.france_travail_service import FranceTravailService

logger = logging.getLogger(__name__)

SEARCH_QUERIES = {
    "Data Science": "data scientist",
    "AI / Machine Learning": "machine learning engineer",
    "Data Analytics": "data analyst",
    "Business Intelligence": "business intelligence",
    "Software Engineering": "software engineer",
    "Data Engineering": "data engineer",
}


class JobSourceManager:
    """Aggregates job listings from all configured sources."""

    def __init__(self):
        self._sources: List[BaseJobSource] = []
        self._register_sources()

    def _register_sources(self):
        self._sources.append(AdzunaSource())
        self._sources.append(FranceTravailService())

    @property
    def sources(self) -> List[BaseJobSource]:
        return list(self._sources)

    def get_source_names(self) -> List[str]:
        return [s.source_name for s in self._sources]

    async def fetch_all(self, query: str = "", **kwargs) -> List[Dict]:
        """Fetch jobs from all sources in parallel."""
        tasks = [s.fetch_jobs(query=query, **kwargs) for s in self._sources]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_jobs = []
        for source, result in zip(self._sources, results):
            if isinstance(result, Exception):
                logger.error(f"{source.source_name} failed: {result}")
                continue
            all_jobs.extend(result)
        return self._deduplicate(all_jobs)

    async def fetch_all_categories(
        self, categories: List[str] = None, results_per_category: int = 10
    ) -> List[Dict]:
        """Fetch jobs across all categories from all sources."""
        if categories is None:
            categories = list(SEARCH_QUERIES.keys())
        tasks = [
            s.fetch_jobs_multi_category(categories, results_per_category)
            for s in self._sources
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        all_jobs = []
        for source, result in zip(self._sources, results):
            if isinstance(result, Exception):
                logger.error(f"{source.source_name} multi-category failed: {result}")
                continue
            all_jobs.extend(result)
        return self._deduplicate(all_jobs)

    async def fetch_by_category(
        self, category: str, results_per_page: int = 20
    ) -> List[Dict]:
        """Fetch jobs for a specific category from all sources."""
        query = SEARCH_QUERIES.get(category, category)
        jobs = await self.fetch_all(query=query, results_per_page=results_per_page)
        for job in jobs:
            job["category"] = category
        return jobs

    def _deduplicate(self, jobs: List[Dict]) -> List[Dict]:
        seen = set()
        unique = []
        for job in jobs:
            jid = job.get("job_id", "")
            if jid not in seen:
                seen.add(jid)
                unique.append(job)
        return unique

    @staticmethod
    async def fetch_from_adzuna_direct(
        query: str = "data science",
        results_per_page: int = 15,
    ) -> List[Dict]:
        """Direct access to adzuna for backward compatibility."""
        from app.services.adzuna_service import fetch_jobs_from_adzuna
        return await fetch_jobs_from_adzuna(query=query, results_per_page=results_per_page)
