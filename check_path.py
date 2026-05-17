import os
d = os.path.dirname("/home/si/airflow/dags/ingest_jobs.py")
print(os.path.abspath(os.path.join(d, "..", "..", "backend")))
