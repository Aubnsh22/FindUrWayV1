import pytest
from app.services.matching_service import (
    _keyword_match_fallback,
    _scale_match_percentage,
)


def test_keyword_match_fallback():
    profile = "Python SQL Docker"
    skills = ["Python", "SQL"]
    jobs = [{"title": "Data Engineer", "description": "Python developer with Docker and Kubernetes experience"}]
    results = _keyword_match_fallback(profile, skills, jobs)
    assert len(results) == 1
    assert 0 <= results[0].match_percentage <= 100


def test_keyword_match_no_overlap():
    profile = "React JavaScript CSS"
    skills = ["React", "CSS"]
    jobs = [{"title": "ML Engineer", "description": "Python machine learning tensorflow"}]
    results = _keyword_match_fallback(profile, skills, jobs)
    assert results[0].match_percentage < 30


def test_scale_match_percentage():
    val = _scale_match_percentage(0.5)
    assert 70 <= val <= 80


def test_scale_match_clamp_low():
    assert _scale_match_percentage(0.0) == 10
    assert _scale_match_percentage(-0.1) == 10


def test_scale_match_clamp_high():
    assert _scale_match_percentage(1.0) == 98
