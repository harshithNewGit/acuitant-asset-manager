#!/bin/bash
# Data Export Script for Asset Manager
# Exports all data from the database to SQL files

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-asset_manager}
DB_PORT=${DB_PORT:-5432}
EXPORT_DIR="./exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create export directory
mkdir -p "$EXPORT_DIR"

echo "=== Exporting Data from $DB_NAME ==="
echo "Timestamp: $TIMESTAMP"
echo ""

# Export schema only (structure)
echo "1. Exporting schema..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --schema-only --no-owner --no-acl \
    -f "$EXPORT_DIR/schema_$TIMESTAMP.sql"

# Export data only
echo "2. Exporting data..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --data-only --column-inserts \
    -f "$EXPORT_DIR/data_$TIMESTAMP.sql"

# Export complete database (schema + data)
echo "3. Exporting complete database..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl \
    -f "$EXPORT_DIR/complete_$TIMESTAMP.sql"

# Export as CSV (for easy inspection)
echo "4. Exporting as CSV files..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY categories TO '$EXPORT_DIR/categories_$TIMESTAMP.csv' CSV HEADER"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY assets TO '$EXPORT_DIR/assets_$TIMESTAMP.csv' CSV HEADER"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY todos TO '$EXPORT_DIR/todos_$TIMESTAMP.csv' CSV HEADER"

echo ""
echo "=== Export Complete ==="
echo "Files saved to: $EXPORT_DIR"
echo "  - schema_$TIMESTAMP.sql (structure only)"
echo "  - data_$TIMESTAMP.sql (data only)"
echo "  - complete_$TIMESTAMP.sql (schema + data)"
echo "  - *.csv files (CSV format)"

