import psycopg2
import locale
try:
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except:
    pass
conn = psycopg2.connect(host="host.docker.internal", port=5432, user="postgres", dbname="findurway", options='-c client_encoding=UTF8')
print("CONNECTED")
conn.close()
