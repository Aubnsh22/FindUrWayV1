import psycopg2
try:
    conn = psycopg2.connect(host="localhost", port=5432, user="postgres", dbname="findurway")
    print("Connected via localhost")
    conn.close()
except Exception as e:
    print(f"localhost failed: {e}")
    import socket
    try:
        gw = open("/proc/net/route").readlines()[1].split()[1]
        print(f"Gateway IP from route: {gw}")
    except:
        pass
