"""Initialize Airflow database programmatically (bypassing CLI)."""
import os, sys
os.environ['AIRFLOW_HOME'] = r'C:\Users\Msi\Desktop\IngestionProject\FindUrWay\airflow'

# Patch before Airflow imports
import signal
if not hasattr(signal, 'SIGALRM'):
    signal.SIGALRM = 15

import contextlib
import airflow.utils.db as db_module

@contextlib.contextmanager
def noop_timeout(seconds=1200, msg="Timed out"):
    yield

db_module.timeout_with_traceback = noop_timeout

from airflow.utils.db import initdb
initdb()
print("Database initialized successfully!")

# Verify
import sqlite3
conn = sqlite3.connect(os.path.join(os.environ['AIRFLOW_HOME'], 'airflow.db'))
cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print(f"Tables created: {len(tables)}")
for t in tables[:20]:
    print(f"  - {t}")
