import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base, engine, SessionLocal, init_db
from app.models.db_models import JobListing, SkillDemand  # noqa


@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    db = SessionLocal()
    yield db
    db.rollback()
    db.close()
