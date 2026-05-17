import psycopg2
for host in ["host.docker.internal", "172.25.240.1"]:
    try:
        conn = psycopg2.connect(host=host, port=5432, user="postgres", dbname="findurway")
        print(f"Connected via {host}")
        conn.close()
    except Exception as e:
        print(f"{host} failed: {e}")
