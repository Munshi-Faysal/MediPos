[CmdletBinding()]
param(
    [ValidateSet("All", "Backend", "Frontend")]
    [string]$Mode = "All"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendScript = Join-Path $root "backend.ps1"
$frontendScript = Join-Path $root "frontend.ps1"

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Name was not found: $Path"
    }
}

function Assert-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string]$InstallMessage
    )

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "$Command was not found. $InstallMessage"
    }
}

function Start-MediPosTerminal {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath
    )

    $shell = Get-Command "powershell.exe" -ErrorAction SilentlyContinue
    if (-not $shell) {
        $shell = Get-Command "pwsh" -ErrorAction SilentlyContinue
    }

    if (-not $shell) {
        throw "PowerShell was not found."
    }

    $quotedScriptPath = '"' + $ScriptPath.Replace('"', '\"') + '"'

    Start-Process `
        -FilePath $shell.Source `
        -WorkingDirectory $root `
        -ArgumentList @(
            "-NoExit",
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-File", $quotedScriptPath
        ) | Out-Null
}

Set-Location $root

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "          MediPos App Launcher           " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($Mode -in @("All", "Backend")) {
    Assert-FileExists -Path $backendScript -Name "Backend launcher"
    Assert-CommandExists -Command "dotnet" -InstallMessage "Install the .NET 10 SDK first."
}

if ($Mode -in @("All", "Frontend")) {
    Assert-FileExists -Path $frontendScript -Name "Frontend launcher"
    Assert-CommandExists -Command "npm" -InstallMessage "Install Node.js first."
}

if ($Mode -in @("All", "Backend")) {
    Write-Host "Starting backend..." -ForegroundColor Yellow
    Start-MediPosTerminal -ScriptPath $backendScript
}

if ($Mode -eq "All") {
    Start-Sleep -Seconds 2
}

if ($Mode -in @("All", "Frontend")) {
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    Start-MediPosTerminal -ScriptPath $frontendScript
}

Write-Host ""
Write-Host "MediPos has been launched." -ForegroundColor Green

if ($Mode -in @("All", "Backend")) {
    Write-Host "Backend API:     https://localhost:7095" -ForegroundColor White
    Write-Host "API Docs:        https://localhost:7095/scalar/v1" -ForegroundColor White
}

if ($Mode -in @("All", "Frontend")) {
    Write-Host "Frontend UI:     http://localhost:4200" -ForegroundColor White
}
