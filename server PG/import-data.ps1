# Data Import Script for Asset Manager (PowerShell)
# Imports data into a new database

param(
    [Parameter(Mandatory=$true)]
    [string]$ExportFile,
    
    [Parameter(Mandatory=$false)]
    [string]$TargetDatabase = "asset_manager"
)

# Load environment variables
$envFile = ".\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }

if (-not (Test-Path $ExportFile)) {
    Write-Host "Error: Export file not found: $ExportFile" -ForegroundColor Red
    exit 1
}

Write-Host "=== Importing Data ===" -ForegroundColor Cyan
Write-Host "Source file: $ExportFile" -ForegroundColor White
Write-Host "Target database: $TargetDatabase" -ForegroundColor White
Write-Host ""

# Check if database exists
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | Select-String -Pattern "\b$TargetDatabase\b"
if (-not $dbExists) {
    Write-Host "Database '$TargetDatabase' does not exist. Creating..." -ForegroundColor Yellow
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $TargetDatabase;"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create database" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Database created" -ForegroundColor Green
}

# Import data
Write-Host "Importing data..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TargetDatabase -f $ExportFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Import Complete ===" -ForegroundColor Cyan
    Write-Host "Verifying data..." -ForegroundColor Yellow
    
    # Count records
    $categories = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TargetDatabase -t -c "SELECT COUNT(*) FROM categories;" | ForEach-Object { $_.Trim() }
    $assets = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TargetDatabase -t -c "SELECT COUNT(*) FROM assets;" | ForEach-Object { $_.Trim() }
    $todos = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TargetDatabase -t -c "SELECT COUNT(*) FROM todos;" | ForEach-Object { $_.Trim() }
    
    Write-Host "  Categories: $categories" -ForegroundColor Green
    Write-Host "  Assets: $assets" -ForegroundColor Green
    Write-Host "  Todos: $todos" -ForegroundColor Green
} else {
    Write-Host "Error: Import failed" -ForegroundColor Red
    exit 1
}

