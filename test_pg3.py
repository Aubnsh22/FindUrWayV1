import psycopg2
conn = psycopg2.connect(host="host.docker.internal", port=5432, user="postgres", dbname="findurway")
print("CONNECTED")
conn.close()
