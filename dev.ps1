# Development Environment Startup Script
# Starts both frontend and backend servers for development
# Can use PM2 or regular npm scripts

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipChecks,
    [switch]$UsePM2
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Asset Manager - Development Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not $SkipChecks) {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node --version
        Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
        exit 1
    }
    
    try {
        $npmVersion = npm --version
        Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ npm not found." -ForegroundColor Red
        exit 1
    }
    
    # Check PM2 if UsePM2 flag is set
    if ($UsePM2) {
        try {
            $pm2Version = pm2 --version
            Write-Host "  ✓ PM2: $pm2Version" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ PM2 not found. Installing globally..." -ForegroundColor Yellow
            npm install -g pm2
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ✗ Failed to install PM2. Continuing without PM2..." -ForegroundColor Yellow
                $UsePM2 = $false
            } else {
                Write-Host "  ✓ PM2 installed" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
}

# Check if dependencies are installed
if (-not $SkipChecks) {
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "  ⚠ Frontend dependencies not found. Installing..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
    }
    
    if (-not (Test-Path "server PG\node_modules")) {
        Write-Host "  ⚠ Backend dependencies not found. Installing..." -ForegroundColor Yellow
        Push-Location "server PG"
        npm install
        Pop-Location
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
    }
    
    Write-Host ""
}

# Check environment files
if (-not $SkipChecks) {
    Write-Host "Checking environment configuration..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Write-Host "  ⚠ .env file not found. Copying from .env.example..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env"
            Write-Host "  ✓ Created .env file. Please update with your configuration." -ForegroundColor Green
        } else {
            Write-Host "  ⚠ .env file not found. Using defaults." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✓ Frontend .env file exists" -ForegroundColor Green
    }
    
    if (-not (Test-Path "server PG\.env")) {
        if (Test-Path "server PG\.env.example") {
            Write-Host "  ⚠ Backend .env file not found. Copying from .env.example..." -ForegroundColor Yellow
            Copy-Item "server PG\.env.example" "server PG\.env"
            Write-Host "  ⚠ Created backend .env file. Please update database credentials!" -ForegroundColor Yellow
        } else {
            Write-Host "  ⚠ Backend .env file not found. Backend may not start." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✓ Backend .env file exists" -ForegroundColor Green
    }
    
    Write-Host ""
}

# Function to start backend
function Start-Backend {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Write-Host "  Location: server PG" -ForegroundColor Gray
    Write-Host "  Port: 3001 (default)" -ForegroundColor Gray
    Write-Host ""
    
    if ($UsePM2) {
        # Create logs directory
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" | Out-Null
        }
        
        pm2 start ecosystem.config.cjs --only asset-manager-backend
        Write-Host "  ✓ Backend server starting with PM2..." -ForegroundColor Green
    } else {
        Push-Location "server PG"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
        Pop-Location
        Start-Sleep -Seconds 2
        Write-Host "  ✓ Backend server starting..." -ForegroundColor Green
    }
    Write-Host ""
}

# Function to start frontend
function Start-Frontend {
    Write-Host "Starting frontend development server..." -ForegroundColor Yellow
    Write-Host "  Location: ." -ForegroundColor Gray
    Write-Host "  Port: 3000 (default)" -ForegroundColor Gray
    Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
    Write-Host ""
    
    if ($UsePM2) {
        # Create logs directory
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" | Out-Null
        }
        
        pm2 start ecosystem.config.cjs --only asset-manager-frontend
        Write-Host "  ✓ Frontend server starting with PM2..." -ForegroundColor Green
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
        Start-Sleep -Seconds 2
        Write-Host "  ✓ Frontend server starting..." -ForegroundColor Green
    }
    Write-Host ""
}

# Start servers based on flags
if ($BackendOnly) {
    Start-Backend
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Backend only mode" -ForegroundColor Cyan
    Write-Host "  Backend: http://localhost:3001" -ForegroundColor Cyan
    if ($UsePM2) {
        Write-Host "  Using PM2 - View logs: pm2 logs asset-manager-backend" -ForegroundColor Gray
    }
    Write-Host "========================================" -ForegroundColor Cyan
} elseif ($FrontendOnly) {
    Start-Frontend
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Frontend only mode" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    if ($UsePM2) {
        Write-Host "  Using PM2 - View logs: pm2 logs asset-manager-frontend" -ForegroundColor Gray
    }
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    # Start both
    Start-Backend
    Start-Sleep -Seconds 3
    Start-Frontend
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Development servers started!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
    Write-Host "  Health:   http://localhost:3001/health" -ForegroundColor White
    Write-Host ""
    if ($UsePM2) {
        Write-Host "  Using PM2 Process Manager" -ForegroundColor Cyan
        Write-Host "  Commands:" -ForegroundColor Yellow
        Write-Host "    pm2 status              - View status" -ForegroundColor Gray
        Write-Host "    pm2 logs                - View all logs" -ForegroundColor Gray
        Write-Host "    pm2 stop all            - Stop all servers" -ForegroundColor Gray
        Write-Host "    pm2 delete all          - Remove from PM2" -ForegroundColor Gray
    } else {
        Write-Host "  Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
    }
    Write-Host ""
}

