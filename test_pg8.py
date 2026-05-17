import pg8000
conn = pg8000.connect(host="host.docker.internal", port=5432, user="postgres", database="findurway")
print("CONNECTED")
conn.close()
