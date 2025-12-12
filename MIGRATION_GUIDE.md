# Database Migration Guide

## Can schema.sql be used for migration?

**✅ YES** - The `schema.sql` file is now **fully compatible** and ready for migration to another PostgreSQL system.

## Migration Compatibility

### ✅ Safe for Migration
- Uses `CREATE TABLE IF NOT EXISTS` - Won't fail if tables already exist
- Uses `CREATE INDEX IF NOT EXISTS` - Won't fail if indexes already exist
- Compatible with PostgreSQL 12+ (tested on PostgreSQL 18.0)
- Includes all required tables, constraints, and indexes
- Foreign key relationships properly defined

### Schema Details

**Tables Created:**
1. `categories` - Asset categories
2. `assets` - Main asset records
3. `todos` - Task list items

**Constraints:**
- Primary keys on all tables
- Unique constraint on `assets.asset_code`
- Unique constraint on `categories.name`
- Foreign key: `assets.category_id` → `categories.id` (ON DELETE SET NULL)

**Indexes:**
- `idx_assets_category_id` - For category filtering
- `idx_assets_status` - For status filtering
- `idx_todos_done` - For todo filtering

## How to Migrate

### Option 1: Fresh Database (Recommended)

```bash
# 1. Create new database
psql -U postgres -c "CREATE DATABASE asset_manager_new;"

# 2. Run schema.sql
psql -U postgres -d asset_manager_new -f "server PG/schema.sql"

# 3. Verify tables created
psql -U postgres -d asset_manager_new -c "\dt"
```

### Option 2: Existing Database

The schema uses `IF NOT EXISTS`, so it's safe to run on existing databases:

```bash
psql -U postgres -d existing_database -f "server PG/schema.sql"
```

### Option 3: Using psql Command Line

```bash
# Connect to target database
psql -U postgres -d target_database

# Run schema file
\i "server PG/schema.sql"

# Verify
\dt
\d assets
\d categories
\d todos
```

### Option 4: Using pgAdmin or DBeaver

1. Open SQL Editor
2. Load `server PG/schema.sql`
3. Execute script
4. Verify tables in Object Explorer

## Migration Checklist

### Before Migration
- [ ] Backup existing database (if migrating data)
- [ ] Verify PostgreSQL version (12+)
- [ ] Check disk space
- [ ] Review schema.sql for any customizations needed

### During Migration
- [ ] Run schema.sql
- [ ] Verify all tables created
- [ ] Check indexes created
- [ ] Verify foreign key constraints

### After Migration
- [ ] Test database connection
- [ ] Update `.env` file with new database credentials
- [ ] Test backend API endpoints
- [ ] Verify data integrity (if data was migrated)

## Data Migration (If Needed)

If you need to migrate **data** along with schema:

### Step 1: Export Data
```bash
# Export from source database
pg_dump -U postgres -d source_database -t categories -t assets -t todos --data-only > data.sql
```

### Step 2: Import Data
```bash
# Import to target database (after schema is created)
psql -U postgres -d target_database -f data.sql
```

### Step 3: Verify Data
```bash
psql -U postgres -d target_database -c "SELECT COUNT(*) FROM assets;"
psql -U postgres -d target_database -c "SELECT COUNT(*) FROM categories;"
psql -U postgres -d target_database -c "SELECT COUNT(*) FROM todos;"
```

## Cross-Platform Compatibility

### ✅ Compatible Systems
- PostgreSQL 12+
- PostgreSQL 13, 14, 15, 16, 17, 18
- AWS RDS PostgreSQL
- Azure Database for PostgreSQL
- Google Cloud SQL for PostgreSQL
- Heroku Postgres
- DigitalOcean Managed Databases
- Self-hosted PostgreSQL

### ⚠️ Not Compatible
- MySQL/MariaDB (different SQL syntax)
- SQLite (different data types)
- SQL Server (different syntax)
- Oracle (different syntax)

## Troubleshooting

### Error: "relation already exists"
**Solution:** This is normal with `IF NOT EXISTS`. The script will skip existing tables.

### Error: "permission denied"
**Solution:** Ensure database user has CREATE privileges:
```sql
GRANT CREATE ON DATABASE target_database TO your_user;
```

### Error: "foreign key constraint"
**Solution:** Ensure categories table is created before assets table (schema.sql handles this).

### Error: "syntax error"
**Solution:** Verify PostgreSQL version is 12+. Check version:
```sql
SELECT version();
```

## Verification Commands

After migration, verify everything works:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Should return: assets, categories, todos

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
-- Should return: assets.category_id → categories.id

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
-- Should return at least 6 indexes (3 primary keys + 3 performance indexes)
```

## Summary

✅ **schema.sql is migration-ready**

- Safe to run on any PostgreSQL 12+ system
- Uses `IF NOT EXISTS` for idempotency
- Includes all tables, constraints, and indexes
- Compatible with cloud and self-hosted PostgreSQL
- Ready for production use

**File Location:** `server PG/schema.sql`

