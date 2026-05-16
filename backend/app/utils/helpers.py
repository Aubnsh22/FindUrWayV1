"""Utility helper functions."""
from datetime import datetime
import re


def format_salary(salary_min=None, salary_max=None) -> str:
    """Format salary range for display."""
    if salary_min and salary_max:
        return f"{salary_min:,.0f} - {salary_max:,.0f} MAD"
    elif salary_min:
        return f"From {salary_min:,.0f} MAD"
    elif salary_max:
        return f"Up to {salary_max:,.0f} MAD"
    return "Salary not specified"


def time_ago(date_str: str) -> str:
    """Convert date string to 'X days ago' format."""
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        diff = datetime.now(dt.tzinfo) - dt
        days = diff.days
        if days == 0:
            return "Today"
        elif days == 1:
            return "Yesterday"
        elif days < 7:
            return f"{days} days ago"
        elif days < 30:
            return f"{days // 7} weeks ago"
        else:
            return f"{days // 30} months ago"
    except (ValueError, TypeError):
        return "Recently"
