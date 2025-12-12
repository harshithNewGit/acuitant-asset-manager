# Data Export Script for Asset Manager (PowerShell)
# Exports all data from the database to SQL files

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
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "asset_manager" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$EXPORT_DIR = ".\exports"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# Create export directory
if (-not (Test-Path $EXPORT_DIR)) {
    New-Item -ItemType Directory -Path $EXPORT_DIR | Out-Null
}

Write-Host "=== Exporting Data from $DB_NAME ===" -ForegroundColor Cyan
Write-Host "Timestamp: $TIMESTAMP" -ForegroundColor Gray
Write-Host ""

# Export schema only (structure)
Write-Host "1. Exporting schema..." -ForegroundColor Yellow
$schemaFile = "$EXPORT_DIR\schema_$TIMESTAMP.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only --no-owner --no-acl -f $schemaFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Schema exported" -ForegroundColor Green
} else {
    Write-Host "   ✗ Schema export failed" -ForegroundColor Red
}

# Export data only
Write-Host "2. Exporting data..." -ForegroundColor Yellow
$dataFile = "$EXPORT_DIR\data_$TIMESTAMP.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --data-only --column-inserts -f $dataFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Data exported" -ForegroundColor Green
} else {
    Write-Host "   ✗ Data export failed" -ForegroundColor Red
}

# Export complete database (schema + data)
Write-Host "3. Exporting complete database..." -ForegroundColor Yellow
$completeFile = "$EXPORT_DIR\complete_$TIMESTAMP.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --no-owner --no-acl -f $completeFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Complete database exported" -ForegroundColor Green
} else {
    Write-Host "   ✗ Complete export failed" -ForegroundColor Red
}

# Export as CSV (for easy inspection)
Write-Host "4. Exporting as CSV files..." -ForegroundColor Yellow
$env:PGPASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }

$csvCategories = "$EXPORT_DIR\categories_$TIMESTAMP.csv"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "COPY categories TO STDOUT CSV HEADER" | Out-File -FilePath $csvCategories -Encoding UTF8

$csvAssets = "$EXPORT_DIR\assets_$TIMESTAMP.csv"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "COPY assets TO STDOUT CSV HEADER" | Out-File -FilePath $csvAssets -Encoding UTF8

$csvTodos = "$EXPORT_DIR\todos_$TIMESTAMP.csv"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "COPY todos TO STDOUT CSV HEADER" | Out-File -FilePath $csvTodos -Encoding UTF8

Write-Host "   ✓ CSV files exported" -ForegroundColor Green

Write-Host ""
Write-Host "=== Export Complete ===" -ForegroundColor Cyan
Write-Host "Files saved to: $EXPORT_DIR" -ForegroundColor White
Write-Host "  - schema_$TIMESTAMP.sql (structure only)" -ForegroundColor Gray
Write-Host "  - data_$TIMESTAMP.sql (data only)" -ForegroundColor Gray
Write-Host "  - complete_$TIMESTAMP.sql (schema + data)" -ForegroundColor Gray
Write-Host "  - *.csv files (CSV format)" -ForegroundColor Gray

