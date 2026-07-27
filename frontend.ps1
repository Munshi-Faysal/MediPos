$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $root "Presentation.UI"
$packageJson = Join-Path $frontendPath "package.json"
$nodeModules = Join-Path $frontendPath "node_modules"

if (-not (Test-Path $packageJson)) {
    throw "Frontend package.json not found: $packageJson"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found. Install Node.js first."
}

Set-Location $frontendPath

if (-not (Test-Path $nodeModules)) {
    Write-Host "node_modules not found. Installing frontend packages..." -ForegroundColor Yellow

    if (Test-Path (Join-Path $frontendPath "package-lock.json")) {
        npm ci
    }
    else {
        npm install
    }
}

Write-Host "Starting MediPos frontend at http://localhost:4200 ..." -ForegroundColor Green
npm start
