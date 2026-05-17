from abc import ABC, abstractmethod
from typing import List, Dict


class BaseJobSource(ABC):
    """Abstract interface for all job data sources."""

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Unique identifier for this source (e.g. 'adzuna', 'france_travail')."""

    @abstractmethod
    async def fetch_jobs(self, query: str, **kwargs) -> List[Dict]:
        """Fetch job listings matching the query from this source."""

    @abstractmethod
    async def fetch_jobs_multi_category(
        self, categories: List[str], results_per_category: int = 10
    ) -> List[Dict]:
        """Fetch jobs across multiple categories for comprehensive matching."""

    def normalize_job(self, job: Dict, country: str = "") -> Dict:
        """Convert source-specific format to unified schema.
        Override if source format differs from standard fields.
        """
        return {
            "job_id": str(job.get("id", "")),
            "title": job.get("title", "Untitled"),
            "company": job.get("company", "Unknown"),
            "location": job.get("location", "Remote"),
            "description": job.get("description", ""),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "url": job.get("url", ""),
            "source": self.source_name,
        }
