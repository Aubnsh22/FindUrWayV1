import requests, json

r = requests.post('http://localhost:8000/api/analyze', 
    json={'text': 'I am a frontend developer with React, Node.js, JavaScript, TypeScript, CSS, HTML, and TailwindCSS'}, 
    timeout=120)
data = r.json()
print(f"Status: {r.status_code}, Total jobs: {len(data.get('jobs',[]))}")
for j in data.get('jobs', [])[:10]:
    expl = j.get('explanation', {})
    summary = expl.get('summary', '')[:80]
    print(f"{j['title'][:45]:45s} {j['match_percentage']:5.1f}%  {summary}")
