# Development & Deployment Scripts

PowerShell scripts for easy development and deployment.

## Development Script (`dev.ps1`)

Starts both frontend and backend development servers.

### Usage

**Start both servers (default):**
```powershell
.\dev.ps1
```

**Start backend only:**
```powershell
.\dev.ps1 -BackendOnly
```

**Start frontend only:**
```powershell
.\dev.ps1 -FrontendOnly
```

**Skip dependency checks:**
```powershell
.\dev.ps1 -SkipChecks
```

### What it does:

1. ✅ Checks Node.js and npm installation
2. ✅ Installs dependencies if missing
3. ✅ Creates `.env` files from `.env.example` if needed
4. ✅ Starts backend server on port 3001
5. ✅ Starts frontend dev server on port 3000
6. ✅ Opens separate PowerShell windows for each server

### Output:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## Deployment Script (`deploy.ps1`)

Builds frontend and starts production server.

### Usage

**Full deployment (build + start):**
```powershell
.\deploy.ps1
```

**Build only (for static hosting):**
```powershell
.\deploy.ps1 -BuildOnly
```

**Start only (assumes build exists):**
```powershell
.\deploy.ps1 -StartOnly
```

**Skip build (if already built):**
```powershell
.\deploy.ps1 -SkipBuild
```

### What it does:

1. ✅ Checks prerequisites
2. ✅ Verifies environment files
3. ✅ Builds frontend for production (`npm run build`)
4. ✅ Installs backend production dependencies
5. ✅ Starts production server (serves API + static files)

### Build Output:

- **Frontend build:** `dist/` directory
- **Backend:** Runs on port 3001
- **Static files:** Served from `dist/` by backend

---

## Quick Start

### Development

```powershell
# Clone/navigate to project
cd acuitant-asset-manager

# Start development servers
.\dev.ps1
```

### Production Deployment

```powershell
# Build and start production server
.\deploy.ps1

# Or build only for static hosting
.\deploy.ps1 -BuildOnly
```

---

## Environment Setup

Both scripts automatically:
- Check for `.env` files
- Create from `.env.example` if missing
- Warn if database credentials need configuration

**Required environment variables:**

**Frontend (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_PORT=3000
```

**Backend (`server PG/.env`):**
```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=asset_manager
DB_PASSWORD=your_password
DB_PORT=5432
```

---

## Troubleshooting

### Script won't run

**Enable PowerShell script execution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use

**Kill process on port:**
```powershell
# Port 3000 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Port 3001 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Dependencies not installing

**Clear cache and reinstall:**
```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force "server PG\node_modules"
npm install
cd "server PG"
npm install
cd ..
```

### Build fails

**Check for errors:**
```powershell
npm run build 2>&1 | Tee-Object build-errors.txt
```

---

## Manual Commands

If you prefer manual control:

### Development

```powershell
# Terminal 1 - Backend
cd "server PG"
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Production

```powershell
# Build frontend
npm run build

# Start backend (serves API + static files)
cd "server PG"
npm start
```

---

## Notes

- Scripts open separate PowerShell windows for each server
- Use `Ctrl+C` in each window to stop servers
- Scripts check and install dependencies automatically
- Environment files are auto-created from examples
- Production build optimizes and minifies code
- Backend serves static files from `dist/` in production mode

