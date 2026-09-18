$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendProject = Join-Path $root "Application\Application.csproj"

if (-not (Test-Path $backendProject)) {
    throw "Backend project not found: $backendProject"
}

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw ".NET SDK was not found. Install .NET 10 SDK first."
}

Set-Location $root

$env:ASPNETCORE_ENVIRONMENT = "Development"

Write-Host "Restoring backend packages..." -ForegroundColor Yellow
dotnet restore $backendProject

Write-Host "Starting MediPos backend at https://localhost:7095 ..." -ForegroundColor Green
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "https://localhost:7095/scalar/v1"
} | Out-Null
dotnet run --project $backendProject --launch-profile "MediPos" --no-restore
