import pytest
from app.services.skill_service import (
    extract_skills,
    identify_missing_skills,
    generate_career_insights,
    generate_learning_paths,
    determine_top_categories,
)
from app.models.schemas import SkillAnalysis


def test_extract_skills():
    result = extract_skills(
        "I am a Python developer with SQL and Docker experience. "
        "I use machine learning and deep learning frameworks."
    )
    assert isinstance(result, SkillAnalysis)
    assert "Python" in result.technical_skills


def test_extract_skills_empty():
    result = extract_skills("")
    assert isinstance(result, SkillAnalysis)
    assert len(result.technical_skills) == 0


def test_identify_missing_skills():
    skills = ["python", "docker", "flask"]
    target = "python java kubernetes flask django"
    missing = identify_missing_skills(skills, target)
    assert "Java" in missing
    assert "Kubernetes" in missing
    assert "python" not in missing
    assert "flask" not in missing


def test_generate_career_insights():
    skills = SkillAnalysis(
        technical_skills=["python", "sql"],
        soft_skills=[],
        tools=["docker"],
        languages=["english"],
        frameworks=["flask"],
    )
    insights = generate_career_insights(skills, ["Data Science", "Backend"], 75.0)
    assert len(insights) > 0
    assert all(insight.title for insight in insights)


def test_generate_learning_paths():
    skills = SkillAnalysis(
        technical_skills=["python", "sql"],
        soft_skills=[],
        tools=[],
        languages=["english"],
        frameworks=[],
    )
    paths = generate_learning_paths(skills, ["Data Science", "Backend"])
    assert len(paths) > 0
    assert any("statistics" in path.skill.lower() for path in paths)


def test_determine_top_categories():
    skills = SkillAnalysis(
        technical_skills=["python", "machine learning", "nlp"],
        soft_skills=["communication"],
        tools=["docker"],
        languages=["english"],
        frameworks=["tensorflow"],
    )
    top = determine_top_categories(skills)
    assert len(top) >= 1
    assert "Data Science" in top
