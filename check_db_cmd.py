import subprocess
import os
os.environ['AIRFLOW_HOME'] = r'C:\Users\Msi\Desktop\IngestionProject\FindUrWay\airflow'
result = subprocess.run(
    [r'C:\Users\Msi\AppData\Local\Programs\Python\Python313\python.exe', 
     r'C:\Users\Msi\Desktop\IngestionProject\FindUrWay\airflow\airflow_patch.py', 'db', '--help'],
    capture_output=True, text=True, timeout=30
)
print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
print(result.stderr[-1000:] if len(result.stderr) > 1000 else result.stderr)
