param(
    [string]$BackendDir = "C:\Users\Msi\Desktop\IngestionProject\FindUrWay\backend"
)
Write-Host "=== FindUrWay Job Ingestion ===" -ForegroundColor Cyan
$start = Get-Date
Write-Host "Started at: $start" -ForegroundColor Gray
Set-Location -LiteralPath $BackendDir
python "airflow_docker/dags/ingest_jobs.py" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Ingestion completed" -ForegroundColor Green
} else {
    Write-Host "FAILED - Exit code: $LASTEXITCODE" -ForegroundColor Red
}
$end = Get-Date
Write-Host "Finished at: $end" -ForegroundColor Gray
