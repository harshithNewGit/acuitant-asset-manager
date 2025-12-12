# PostgreSQL Database Setup Guide

## Prerequisites
- PostgreSQL installed (✅ Detected: PostgreSQL 18.0)
- Node.js installed

## Step 1: Start PostgreSQL Service

### Windows (PowerShell as Administrator):
```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-18

# Or if using different version:
# Get-Service | Where-Object {$_.Name -like "*postgresql*"}
# Start-Service <service-name>
```

### Windows (Services GUI):
1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-18" (or similar)
3. Right-click → Start

### Alternative (if service not found):
```powershell
# Navigate to PostgreSQL bin directory (usually)
cd "C:\Program Files\PostgreSQL\18\bin"
# Start PostgreSQL manually
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\18\data" start
```

## Step 2: Create Database

Open PowerShell and run:

```powershell
# Connect to PostgreSQL (default user is usually 'postgres')
psql -U postgres

# Or if you have a password set:
psql -U postgres -h localhost
```

Once connected, run these SQL commands:

```sql
-- Create database
CREATE DATABASE asset_manager;

-- Connect to the new database
\c asset_manager

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create assets table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(100) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    fa_ledger VARCHAR(100),
    date_of_purchase DATE,
    cost_of_asset DECIMAL(12, 2),
    useful_life INTERVAL,
    number_marked VARCHAR(100),
    quantity INTEGER,
    assigned_to VARCHAR(255),
    location VARCHAR(255),
    closing_stock_rs DECIMAL(12, 2),
    status VARCHAR(50) NOT NULL,
    remarks TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_subscription BOOLEAN DEFAULT FALSE,
    subscription_vendor VARCHAR(255),
    subscription_renewal_date DATE,
    subscription_billing_cycle VARCHAR(50),
    subscription_url TEXT
);

-- Create todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_assets_category_id ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_todos_done ON todos(done);

-- Exit psql
\q
```

## Step 3: Configure Environment Variables

Create `server PG/.env` file:

```env
# Backend Environment Variables
PORT=3001

# PostgreSQL Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=asset_manager
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432
```

**Important:** Replace `your_postgres_password_here` with your actual PostgreSQL password.

## Step 4: Test Database Connection

```powershell
# Test connection
psql -U postgres -d asset_manager -h localhost
```

If successful, you'll see:
```
psql (18.0)
Type "help" for help.

asset_manager=#
```

## Step 5: Start Backend Server

```powershell
cd "server PG"
npm install  # If not already done
npm start    # Production mode
# OR
npm run dev  # Development mode with auto-reload
```

You should see:
```
Server running on port 3001
Connected to PostgreSQL: { now: '2024-...' }
```

## Step 6: Verify Health Endpoint

In a new terminal:
```powershell
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-..."
}
```

## Troubleshooting

### PostgreSQL service not starting:
```powershell
# Check if PostgreSQL is running
Get-Service | Where-Object {$_.Name -like "*postgresql*"}

# Check PostgreSQL logs
Get-Content "C:\Program Files\PostgreSQL\18\data\log\*.log" -Tail 50
```

### Connection refused:
- Ensure PostgreSQL service is running
- Check firewall settings
- Verify port 5432 is not blocked
- Check `DB_HOST` in `.env` matches your setup

### Authentication failed:
- Verify `DB_USER` and `DB_PASSWORD` in `.env`
- Check PostgreSQL authentication settings in `pg_hba.conf`

### Database doesn't exist:
- Run the CREATE DATABASE command from Step 2
- Verify `DB_NAME` in `.env` matches the created database

## Quick Start Commands

```powershell
# 1. Start PostgreSQL service
Start-Service postgresql-x64-18

# 2. Create database (if not exists)
psql -U postgres -c "CREATE DATABASE asset_manager;" 2>$null

# 3. Start backend server
cd "server PG"
npm start
```

## Next Steps

After backend is running:
1. Start frontend: `npm run dev` (from root directory)
2. Open browser: `http://localhost:3000`
3. The app will connect to the backend API automatically

