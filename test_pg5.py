import psycopg2
conn = psycopg2.connect(host="100.93.99.242", port=5432, user="postgres", dbname="findurway")
print("CONNECTED")
conn.close()
