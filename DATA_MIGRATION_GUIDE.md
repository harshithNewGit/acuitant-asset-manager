# Data Migration Guide

Complete guide for migrating data from your current PostgreSQL database to another system.

## Quick Start

### Step 1: Export Data

**Windows (PowerShell):**
```powershell
cd "server PG"
.\export-data.ps1
```

**Linux/Mac:**
```bash
cd "server PG"
chmod +x export-data.sh
./export-data.sh
```

### Step 2: Import Data

**Windows (PowerShell):**
```powershell
cd "server PG"
.\import-data.ps1 -ExportFile ".\exports\complete_20240101_120000.sql" -TargetDatabase "asset_manager_new"
```

**Linux/Mac:**
```bash
cd "server PG"
./import-data.sh exports/complete_20240101_120000.sql asset_manager_new
```

---

## Detailed Migration Process

### Method 1: Complete Database Export/Import (Recommended)

This method exports everything (schema + data) in one file.

#### Export

```bash
# Using pg_dump
pg_dump -h localhost -p 5432 -U postgres -d assetmanager_db \
    --no-owner --no-acl \
    -f backup_complete.sql

# Or using the script
cd "server PG"
.\export-data.ps1  # Windows
# or
./export-data.sh   # Linux/Mac
```

#### Import

```bash
# Create target database first
psql -U postgres -c "CREATE DATABASE asset_manager_new;"

# Import complete backup
psql -U postgres -d asset_manager_new -f backup_complete.sql

# Or using the script
.\import-data.ps1 -ExportFile "backup_complete.sql" -TargetDatabase "asset_manager_new"
```

### Method 2: Schema + Data Separate

Export schema and data separately for more control.

#### Export Schema Only
```bash
pg_dump -h localhost -p 5432 -U postgres -d assetmanager_db \
    --schema-only --no-owner --no-acl \
    -f schema_backup.sql
```

#### Export Data Only
```bash
pg_dump -h localhost -p 5432 -U postgres -d assetmanager_db \
    --data-only --column-inserts \
    -f data_backup.sql
```

#### Import Separately
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE asset_manager_new;"

# 2. Import schema
psql -U postgres -d asset_manager_new -f schema_backup.sql

# 3. Import data
psql -U postgres -d asset_manager_new -f data_backup.sql
```

### Method 3: Using Schema.sql + Data Export

If you've already created the schema on the target system:

```bash
# 1. Create schema on target (if not done)
psql -U postgres -d target_database -f "server PG/schema.sql"

# 2. Export only data
pg_dump -h source_host -U source_user -d source_db \
    --data-only --column-inserts \
    -f data_only.sql

# 3. Import data
psql -U postgres -d target_database -f data_only.sql
```

---

## Migration Scenarios

### Scenario 1: Same Server, Different Database

```bash
# Export
pg_dump -U postgres -d assetmanager_db -f backup.sql

# Create new database
psql -U postgres -c "CREATE DATABASE asset_manager_new;"

# Import
psql -U postgres -d asset_manager_new -f backup.sql
```

### Scenario 2: Different Server (Remote)

```bash
# Export from source server
pg_dump -h source_host -p 5432 -U source_user -d source_db \
    --no-owner --no-acl \
    -f backup.sql

# Transfer file to target server (using scp, rsync, etc.)
scp backup.sql user@target_server:/path/to/

# Import on target server
psql -h target_host -U target_user -d target_db -f backup.sql
```

### Scenario 3: Cloud Migration (AWS RDS, Azure, etc.)

#### Export from Local
```bash
pg_dump -h localhost -U postgres -d assetmanager_db \
    --no-owner --no-acl \
    -f backup.sql
```

#### Import to Cloud
```bash
# AWS RDS example
psql -h your-rds-endpoint.amazonaws.com \
     -p 5432 \
     -U admin \
     -d asset_manager \
     -f backup.sql

# Azure example
psql -h your-server.postgres.database.azure.com \
     -p 5432 \
     -U admin@your-server \
     -d asset_manager \
     -f backup.sql
```

### Scenario 4: CSV Export/Import (For Data Inspection)

#### Export to CSV
```bash
# Categories
psql -U postgres -d assetmanager_db -c "\COPY categories TO 'categories.csv' CSV HEADER"

# Assets
psql -U postgres -d assetmanager_db -c "\COPY assets TO 'assets.csv' CSV HEADER"

# Todos
psql -U postgres -d assetmanager_db -c "\COPY todos TO 'todos.csv' CSV HEADER"
```

#### Import from CSV
```bash
# First ensure schema exists
psql -U postgres -d target_db -f "server PG/schema.sql"

# Import CSV files
psql -U postgres -d target_db -c "\COPY categories FROM 'categories.csv' CSV HEADER"
psql -U postgres -d target_db -c "\COPY assets FROM 'assets.csv' CSV HEADER"
psql -U postgres -d target_db -c "\COPY todos FROM 'todos.csv' CSV HEADER"
```

---

## Verification Steps

After migration, always verify:

### 1. Check Table Counts
```sql
SELECT 
    'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'assets', COUNT(*) FROM assets
UNION ALL
SELECT 'todos', COUNT(*) FROM todos;
```

### 2. Verify Foreign Keys
```sql
-- Check for orphaned assets
SELECT COUNT(*) 
FROM assets a
WHERE a.category_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.id = a.category_id
);
-- Should return 0
```

### 3. Check Data Integrity
```sql
-- Sample data check
SELECT * FROM categories LIMIT 5;
SELECT asset_code, asset_name, status FROM assets LIMIT 5;
SELECT * FROM todos LIMIT 5;
```

### 4. Test Application
```bash
# Update .env with new database credentials
# Start backend server
cd "server PG"
npm start

# Test health endpoint
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/assets
curl http://localhost:3001/categories
curl http://localhost:3001/todos
```

---

## Troubleshooting

### Error: "permission denied"
**Solution:** Ensure user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE target_db TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```

### Error: "relation already exists"
**Solution:** Drop existing tables or use `--clean` flag:
```bash
pg_dump --clean --if-exists ...
```

### Error: "encoding mismatch"
**Solution:** Specify encoding:
```bash
pg_dump --encoding=UTF8 ...
psql --set client_encoding=UTF8 ...
```

### Error: "connection refused"
**Solution:** Check:
- PostgreSQL service is running
- Firewall allows connection
- Host/port are correct
- SSL requirements (for cloud)

### Large Database Performance

For large databases, use compressed format:
```bash
# Export compressed
pg_dump -Fc -f backup.dump database_name

# Import compressed
pg_restore -d target_database backup.dump
```

---

## Best Practices

1. **Always Backup First**
   ```bash
   pg_dump -U postgres -d source_db -f backup_before_migration.sql
   ```

2. **Test Migration on Staging First**
   - Never migrate directly to production
   - Test on a copy first

3. **Verify Data Integrity**
   - Compare record counts
   - Spot-check sample data
   - Test application functionality

4. **Maintain Transaction Logs**
   - Keep export files for audit
   - Document migration date/time

5. **Update Configuration**
   - Update `.env` files
   - Update connection strings
   - Test all environments

---

## Migration Checklist

### Pre-Migration
- [ ] Backup source database
- [ ] Verify source database is healthy
- [ ] Document current record counts
- [ ] Prepare target database credentials
- [ ] Test connection to target database

### During Migration
- [ ] Export data from source
- [ ] Verify export file integrity
- [ ] Create target database (if needed)
- [ ] Import schema (if separate)
- [ ] Import data
- [ ] Verify import success

### Post-Migration
- [ ] Verify record counts match
- [ ] Check foreign key integrity
- [ ] Test sample queries
- [ ] Update application configuration
- [ ] Test application endpoints
- [ ] Monitor for errors
- [ ] Document migration completion

---

## Quick Reference

### Export Commands
```bash
# Complete database
pg_dump -U user -d database -f backup.sql

# Schema only
pg_dump -U user -d database --schema-only -f schema.sql

# Data only
pg_dump -U user -d database --data-only -f data.sql

# Compressed
pg_dump -U user -d database -Fc -f backup.dump
```

### Import Commands
```bash
# From SQL file
psql -U user -d database -f backup.sql

# From compressed dump
pg_restore -U user -d database backup.dump

# With custom options
psql -U user -d database -f backup.sql --set ON_ERROR_STOP=on
```

---

## Summary

✅ **Your data migration is ready!**

- Use `export-data.ps1` (Windows) or `export-data.sh` (Linux/Mac) to export
- Use `import-data.ps1` (Windows) or `import-data.sh` (Linux/Mac) to import
- Or use pg_dump/pg_restore commands directly
- Always verify after migration

**Files Created:**
- `server PG/export-data.ps1` - Windows export script
- `server PG/export-data.sh` - Linux/Mac export script
- `server PG/import-data.ps1` - Windows import script
- `server PG/import-data.sh` - Linux/Mac import script
- `DATA_MIGRATION_GUIDE.md` - Complete guide

