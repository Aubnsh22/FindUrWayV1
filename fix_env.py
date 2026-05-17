with open("/home/si/backend/.env", "r") as f:
    content = f.read()
content = content.replace("localhost:5432", "host.docker.internal:5432")
with open("/home/si/backend/.env", "w") as f:
    f.write(content)
print("Fixed!")
