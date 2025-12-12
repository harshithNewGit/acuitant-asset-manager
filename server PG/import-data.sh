#!/bin/bash
# Data Import Script for Asset Manager
# Imports data into a new database

# Usage: ./import-data.sh <export_file.sql> [target_database]

if [ -z "$1" ]; then
    echo "Usage: $0 <export_file.sql> [target_database]"
    echo "Example: $0 exports/complete_20240101_120000.sql asset_manager_new"
    exit 1
fi

EXPORT_FILE=$1
TARGET_DB=${2:-asset_manager}

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

if [ ! -f "$EXPORT_FILE" ]; then
    echo "Error: Export file not found: $EXPORT_FILE"
    exit 1
fi

echo "=== Importing Data ==="
echo "Source file: $EXPORT_FILE"
echo "Target database: $TARGET_DB"
echo ""

# Check if database exists
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$TARGET_DB"; then
    echo "Database '$TARGET_DB' does not exist. Creating..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $TARGET_DB;"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create database"
        exit 1
    fi
    echo "✓ Database created"
fi

# Import data
echo "Importing data..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" -f "$EXPORT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Import Complete ==="
    echo "Verifying data..."
    
    # Count records
    CATEGORIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM categories;")
    ASSETS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM assets;")
    TODOS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM todos;")
    
    echo "  Categories: $CATEGORIES"
    echo "  Assets: $ASSETS"
    echo "  Todos: $TODOS"
else
    echo "Error: Import failed"
    exit 1
fi

