# Production Deployment Script with PM2
# Builds frontend and deploys backend using PM2

param(
    [switch]$BuildOnly,
    [switch]$StartOnly,
    [switch]$SkipBuild,
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Logs,
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Asset Manager - Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
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

# Check PM2
try {
    $pm2Version = pm2 --version
    Write-Host "  ✓ PM2: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ PM2 not found. Installing globally..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to install PM2. Please install manually: npm install -g pm2" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ PM2 installed" -ForegroundColor Green
}

Write-Host ""

# Check environment files
Write-Host "Checking environment configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "  ⚠ Frontend .env file not found!" -ForegroundColor Yellow
    Write-Host "     Creating from .env.example..." -ForegroundColor Gray
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✓ Created .env file. Please update with production values." -ForegroundColor Green
    } else {
        Write-Host "  ✗ .env.example not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Frontend .env file exists" -ForegroundColor Green
}

if (-not (Test-Path "server PG\.env")) {
    Write-Host "  ⚠ Backend .env file not found!" -ForegroundColor Yellow
    Write-Host "     Creating from .env.example..." -ForegroundColor Gray
    if (Test-Path "server PG\.env.example") {
        Copy-Item "server PG\.env.example" "server PG\.env"
        Write-Host "  ⚠ Created backend .env file. Please update database credentials!" -ForegroundColor Yellow
    } else {
        Write-Host "  ✗ Backend .env.example not found. Cannot create .env file." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Backend .env file exists" -ForegroundColor Green
}

Write-Host ""

# Build frontend
if (-not $SkipBuild -and -not $StartOnly) {
    Write-Host "Building frontend for production..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if dependencies are installed
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
    
    # Set production environment
    $env:NODE_ENV = "production"
    
    # Build
    Write-Host "  Running production build..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path "dist")) {
        Write-Host "  ✗ Build output not found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  ✓ Frontend built successfully" -ForegroundColor Green
    Write-Host "  ✓ Build output: dist/" -ForegroundColor Green
    Write-Host ""
}

# Check backend dependencies
if (-not $BuildOnly) {
    Write-Host "Preparing backend..." -ForegroundColor Yellow
    
    if (-not (Test-Path "server PG\node_modules")) {
        Write-Host "  Installing backend dependencies..." -ForegroundColor Yellow
        Push-Location "server PG"
        npm install --production
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

# Handle PM2 commands
if ($Stop) {
    Write-Host "Stopping PM2 processes..." -ForegroundColor Yellow
    pm2 stop ecosystem.production.config.cjs
    pm2 delete ecosystem.production.config.cjs
    Write-Host "  ✓ Processes stopped" -ForegroundColor Green
    Write-Host ""
    exit 0
}

if ($Restart) {
    Write-Host "Restarting PM2 processes..." -ForegroundColor Yellow
    pm2 restart ecosystem.production.config.cjs
    Write-Host "  ✓ Processes restarted" -ForegroundColor Green
    Write-Host ""
    exit 0
}

if ($Status) {
    Write-Host "PM2 Process Status:" -ForegroundColor Cyan
    Write-Host ""
    pm2 status
    Write-Host ""
    pm2 list
    exit 0
}

if ($Logs) {
    Write-Host "Showing PM2 logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    Write-Host ""
    pm2 logs asset-manager
    exit 0
}

# Start production server with PM2
if (-not $BuildOnly) {
    Write-Host "Deploying with PM2..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create logs directory
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
        Write-Host "  ✓ Created logs directory" -ForegroundColor Green
    }
    
    # Stop existing processes if running
    Write-Host "  Stopping existing processes..." -ForegroundColor Gray
    pm2 stop ecosystem.production.config.cjs 2>$null
    pm2 delete ecosystem.production.config.cjs 2>$null
    
    Write-Host "  Starting production server with PM2..." -ForegroundColor Yellow
    
    # Start with PM2
    pm2 start ecosystem.production.config.cjs --env production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Server started with PM2" -ForegroundColor Green
        
        # Save PM2 process list
        pm2 save
        
        Write-Host ""
        Write-Host "  Server Information:" -ForegroundColor Cyan
        Write-Host "    - API: http://localhost:3001" -ForegroundColor White
        if (-not $SkipBuild) {
            Write-Host "    - Frontend: http://localhost:3001 (from dist/)" -ForegroundColor White
        }
        Write-Host "    - Health: http://localhost:3001/health" -ForegroundColor White
        Write-Host ""
        Write-Host "  PM2 Commands:" -ForegroundColor Cyan
        Write-Host "    pm2 status              - View process status" -ForegroundColor Gray
        Write-Host "    pm2 logs asset-manager  - View logs" -ForegroundColor Gray
        Write-Host "    pm2 restart asset-manager - Restart server" -ForegroundColor Gray
        Write-Host "    pm2 stop asset-manager  - Stop server" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "  ✗ Failed to start with PM2" -ForegroundColor Red
        exit 1
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($BuildOnly) {
    Write-Host "  Build Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Frontend build: dist/" -ForegroundColor White
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "    1. Run: .\deploy.ps1 -StartOnly" -ForegroundColor Gray
    Write-Host "    2. Or deploy dist/ to static hosting" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Server running with PM2" -ForegroundColor White
    Write-Host "  View status: .\deploy.ps1 -Status" -ForegroundColor Gray
    Write-Host "  View logs: .\deploy.ps1 -Logs" -ForegroundColor Gray
    Write-Host "  Restart: .\deploy.ps1 -Restart" -ForegroundColor Gray
    Write-Host "  Stop: .\deploy.ps1 -Stop" -ForegroundColor Gray
    Write-Host ""
}

