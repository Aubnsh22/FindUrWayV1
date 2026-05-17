import sqlite3
conn = sqlite3.connect(r'C:\Users\Msi\Desktop\IngestionProject\FindUrWay\airflow\airflow.db')
cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print(f"Tables ({len(tables)}): {tables}")
