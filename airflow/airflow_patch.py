"""Patch Airflow for Windows compatibility. Run as: python airflow_patch.py <airflow args>"""
import signal
import contextlib
import sys
import os

# Patch before any Airflow imports
signal.SIGALRM = 15
os.environ['AIRFLOW__SCHEDULER__ENABLE_HEALTH_CHECK'] = 'False'

import airflow.utils.db as db_module

@contextlib.contextmanager
def _noop_timeout(seconds=1200, msg="Timed out"):
    yield

db_module.timeout_with_traceback = _noop_timeout

# Remove this script's path so airflow imports resolve correctly
sys.argv.pop(0)
from airflow.__main__ import main
main()
