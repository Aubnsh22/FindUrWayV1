import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import urlparse
import sys

def create_db():
    try:
        # Connect to default postgres database to create the new one
        conn = psycopg2.connect(
            user="postgres",
            password="102004",
            host="localhost",
            port="5432",
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if findurway exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'findurway'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Creating database 'findurway'...")
            cursor.execute("CREATE DATABASE findurway")
            print("Database created successfully.")
        else:
            print("Database 'findurway' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_db()
