# FindUrWay - Progress Summary

## Goal
Deliver FindUrWay AI career platform with Apache Airflow job ingestion, semantic matching, role-aware scoring, Morocco market intelligence, and CV parsing.

## Status: ALL SYSTEMS GO

### ✅ Completed
- **Apache Airflow running in WSL** (Python 3.12, Airflow 2.10.2, SequentialExecutor)
- **Airflow Web UI**: `http://localhost:8080` (admin/admin)
- **DAG**: `findurway_job_ingestion` — daily schedule, real API data
- **PostgreSQL**: Windows PostgreSQL 17 accessible from WSL via `host.docker.internal`
- **Adzuna API**: Real GB + FR job market data (6 categories)
- **France Travail API**: Real French job market data (OAuth2)
- **516 jobs stored** across 6 categories (Data Science, AI/ML, Data Analytics, BI, Software Eng, Data Eng)
- **40 skills tracked** with demand metrics
- **27/27 pytest tests passing**
- **Frontend** (`localhost:5173`) + **Backend** (`localhost:8000`) live
- **Role-aware matching**, weighted scoring, CV parsing, Morocco market insights

### Architecture
```
Windows Host
├── PostgreSQL 17 (port 5432, pg_hba.conf allows samenet)
├── WSL Ubuntu
│   ├── Airflow Scheduler
│   ├── Airflow Webserver (port 8080)
│   └── DAG → Task Subprocess (forks from scheduler)
│       ├── Reads .env from /home/si/backend/.env (symlink to Windows)
│       ├── DATABASE_URL=postgresql://postgres@host.docker.internal:5432/findurway
│       ├── Adzuna API (GB + FR) → 40 jobs/category
│       └── France Travail API → 20 jobs/category
└── Backend (uvicorn :8000) + Frontend (vite :5173)
```

### Key Fixes Applied
1. **pg_hba.conf**: Added `host all all samenet trust` for WSL subnet
2. **DATABASE_URL ordering**: Env var set BEFORE `app.database` imports (which creates engine eagerly)
3. **lru_cache cleared**: `get_settings.cache_clear()` before DAG parsing to reset cached config in forked subprocesses
4. **env vars exported**: DAG reads `.env` file and exports all vars so pydantic-settings picks them up

### Airflow Commands
```bash
# Start scheduler
cd ~/airflow && airflow scheduler -D

# Start webserver
cd ~/airflow && airflow webserver --port 8080 -D

# Trigger DAG
airflow dags trigger findurway_job_ingestion

# Check runs
airflow dags list-runs --dag-id findurway_job_ingestion

# View logs
# ~/airflow/logs/dag_id=findurway_job_ingestion/<run_id>/task_id=fetch_and_store_all_categories/attempt=1.log
```
