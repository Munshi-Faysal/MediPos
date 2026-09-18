$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting MediPos Fullstack Development  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Launching MediPos Backend (API + Scalar Docs)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $root "backend.ps1")

Start-Sleep -Seconds 2

Write-Host "2. Launching MediPos Frontend (Angular App)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $root "frontend.ps1")

Write-Host "`nBoth Backend and Frontend have been launched in separate terminals!" -ForegroundColor Green
Write-Host "Backend API:      https://localhost:7095" -ForegroundColor White
Write-Host "Scalar API Docs:  https://localhost:7095/scalar/v1" -ForegroundColor White
Write-Host "Frontend UI:      http://localhost:4200" -ForegroundColor White
