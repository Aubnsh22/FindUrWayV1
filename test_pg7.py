import traceback, sys
try:
    import psycopg2
    conn = psycopg2.connect(host="host.docker.internal", port=5432, user="postgres", dbname="findurway")
    print("CONNECTED")
    conn.close()
except Exception:
    traceback.print_exc()
    # Print the actual bytes around position 101
    import io, logging
    logging.basicConfig(level=logging.DEBUG)
