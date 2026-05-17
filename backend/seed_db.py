import logging
import requests
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO)

DB_URL = "postgresql://postgres:admin@localhost:5432/findurway"
ADZUNA_APP_ID = "548b8083"
ADZUNA_APP_KEY = "8e4c6b877fbee36db3224141eb81ebff"

def seed_database():
    """Try to fetch jobs from Adzuna. If network fails, use mock data."""
    engine = create_engine(DB_URL)
    jobs = []
    
    try:
        logging.info("Attempting to fetch real jobs from Adzuna API...")
        url = "https://api.adzuna.com/v1/api/jobs/ma/search/1"
        params = {
            'app_id': ADZUNA_APP_ID,
            'app_key': ADZUNA_APP_KEY,
            'results_per_page': 50,
            'what': 'developer',
            'content-type': 'application/json'
        }
        # Using requests instead of httpx (often more stable with Windows network adapters)
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        jobs = response.json().get('results', [])
        logging.info(f"✅ Success! Fetched {len(jobs)} real jobs.")
        
    except Exception as e:
        logging.error(f"❌ Network request failed: {e}")
        logging.warning("⚠️ Your Windows computer is blocking the internet request (Proxy/Firewall/VPN).")
        logging.info("Injecting MOCK DATA instead so you can test the application!")
        
        jobs = [
            {
                "id": "mock_1", "title": "Senior Python Backend Developer", 
                "description": "Looking for an expert Python developer with FastAPI and SQL experience to build AI pipelines.", 
                "location": {"display_name": "Casablanca, Casablanca-Settat"}, 
                "company": {"display_name": "TechFlow Maroc"}, 
                "salary_min": 20000, "redirect_url": "https://example.com/job1"
            },
            {
                "id": "mock_2", "title": "React Frontend Engineer", 
                "description": "Join our team to build beautiful UIs with React, Vite, and Tailwind CSS.", 
                "location": {"display_name": "Rabat, Rabat-Salé-Kénitra"}, 
                "company": {"display_name": "Web Solutions Agency"}, 
                "salary_min": 15000, "redirect_url": "https://example.com/job2"
            },
            {
                "id": "mock_3", "title": "Data Scientist (NLP)", 
                "description": "Must have experience with PyTorch, Sentence Transformers, and Scikit-Learn.", 
                "location": {"display_name": "Marrakech, Marrakech-Safi"}, 
                "company": {"display_name": "AI Innovations"}, 
                "salary_min": 25000, "redirect_url": "https://example.com/job3"
            },
            {
                "id": "mock_4", "title": "Full Stack Developer", 
                "description": "Looking for someone who knows React and Python. Apache Airflow experience is a plus.", 
                "location": {"display_name": "Tangier, Tanger-Tetouan-Al Hoceima"}, 
                "company": {"display_name": "StartUp Hub"}, 
                "salary_min": 18000, "redirect_url": "https://example.com/job4"
            }
        ]

    # Insert data into PostgreSQL
    try:
        with engine.begin() as conn:
            for job in jobs:
                conn.execute(
                    text("INSERT INTO jobs (title, description, location, company, salary_min, url, adzuna_id) "
                         "VALUES (:title, :description, :location, :company, :salary_min, :url, :adzuna_id) "
                         "ON CONFLICT (adzuna_id) DO NOTHING"),
                    {
                        "title": job.get('title'),
                        "description": job.get('description'),
                        "location": job.get('location', {}).get('display_name'),
                        "company": job.get('company', {}).get('display_name'),
                        "salary_min": job.get('salary_min'),
                        "url": job.get('redirect_url'),
                        "adzuna_id": str(job.get('id'))
                    }
                )
        logging.info(f"✅ Successfully saved {len(jobs)} jobs to the database!")
    except Exception as db_err:
        logging.error(f"Database error: {db_err}")

if __name__ == "__main__":
    seed_database()