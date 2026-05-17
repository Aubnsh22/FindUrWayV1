from app.config import get_settings


def test_settings_defaults():
    s = get_settings()
    assert s.DATABASE_URL is not None
    assert s.ADZUNA_APP_ID is not None
    assert s.MODEL_NAME == "all-MiniLM-L6-v2"
    assert s.FRONTEND_URL is not None


def test_settings_cached():
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2
