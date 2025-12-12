# PM2 Process Manager Guide

Complete guide for running the Asset Manager application with PM2.

## Installation

Install PM2 globally:
```powershell
npm install -g pm2
```

## Quick Start

### Development Mode

**Using PM2:**
```powershell
.\dev.ps1 -UsePM2
```

**Traditional mode (separate windows):**
```powershell
.\dev.ps1
```

### Production Deployment

```powershell
# Build and deploy
.\deploy.ps1

# Or build only
.\deploy.ps1 -BuildOnly

# Then start
.\deploy.ps1 -StartOnly
```

## PM2 Commands

### Basic Commands

```powershell
# View status
.\deploy.ps1 -Status
# or
pm2 status

# View logs
.\deploy.ps1 -Logs
# or
pm2 logs asset-manager

# Restart
.\deploy.ps1 -Restart
# or
pm2 restart asset-manager

# Stop
.\deploy.ps1 -Stop
# or
pm2 stop asset-manager
pm2 delete asset-manager
```

### Advanced Commands

```powershell
# View detailed info
pm2 show asset-manager

# Monitor (real-time)
pm2 monit

# View logs with filtering
pm2 logs asset-manager --lines 100
pm2 logs asset-manager --err
pm2 logs asset-manager --out

# Restart with zero downtime
pm2 reload asset-manager

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Save current process list
pm2 save

# Resurrect saved processes (on reboot)
pm2 resurrect
```

## Configuration Files

### Development (`ecosystem.config.cjs`)

Manages both frontend and backend in development mode:
- Backend: `asset-manager-backend` (port 3001)
- Frontend: `asset-manager-frontend` (port 3000)

### Production (`ecosystem.production.config.cjs`)

Single process for production:
- Backend serves API + static files (port 3001)
- Optimized for production environment

## Deployment Workflow

### 1. Build Frontend
```powershell
.\deploy.ps1 -BuildOnly
```

### 2. Deploy with PM2
```powershell
.\deploy.ps1
```

This will:
- Build frontend (if not skipped)
- Install production dependencies
- Start backend with PM2
- Serve static files from `dist/`

### 3. Verify Deployment
```powershell
# Check status
.\deploy.ps1 -Status

# Check health
curl http://localhost:3001/health

# View logs
.\deploy.ps1 -Logs
```

## PM2 Startup Script (Auto-start on Boot)

### Windows

```powershell
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### Linux

```bash
# Generate startup script
pm2 startup

# Follow the instructions shown, then:
pm2 save
```

## Cluster Mode (Load Balancing)

To run multiple instances for load balancing, edit `ecosystem.production.config.cjs`:

```javascript
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'  // Cluster mode
}
```

Then restart:
```powershell
pm2 restart ecosystem.production.config.cjs
```

## Monitoring

### Real-time Monitoring
```powershell
pm2 monit
```

### Metrics
```powershell
pm2 list
pm2 show asset-manager
```

### Log Management

Logs are stored in `logs/` directory:
- `logs/error.log` - Error logs
- `logs/out.log` - Output logs
- `logs/combined.log` - Combined logs

## Environment Variables

PM2 automatically loads environment variables from:
1. `.env` file (via dotenv)
2. `env_production` section in ecosystem config
3. System environment variables

## Troubleshooting

### Process won't start

```powershell
# Check logs
pm2 logs asset-manager --err

# Check if port is in use
netstat -ano | findstr :3001

# Kill process on port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Process keeps restarting

```powershell
# Check error logs
pm2 logs asset-manager --err --lines 50

# Check restart count
pm2 status

# Disable auto-restart temporarily
pm2 stop asset-manager
```

### Memory issues

```powershell
# Check memory usage
pm2 monit

# Restart if memory exceeds limit
pm2 restart asset-manager
```

### Logs not appearing

```powershell
# Check log file permissions
# Ensure logs/ directory exists
New-Item -ItemType Directory -Path logs -Force

# Flush logs
pm2 flush
```

## Production Best Practices

1. **Use PM2 in production**
   ```powershell
   .\deploy.ps1
   ```

2. **Set up auto-start on boot**
   ```powershell
   pm2 startup
   pm2 save
   ```

3. **Monitor regularly**
   ```powershell
   pm2 monit
   ```

4. **Set up log rotation**
   ```powershell
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

5. **Use cluster mode for high traffic**
   - Edit `ecosystem.production.config.cjs`
   - Set `instances: 'max'` and `exec_mode: 'cluster'`

6. **Set memory limits**
   - Already configured: `max_memory_restart: '1G'`

## Script Commands Reference

### Development Script (`dev.ps1`)

```powershell
.\dev.ps1              # Start both (separate windows)
.\dev.ps1 -UsePM2      # Start both with PM2
.\dev.ps1 -BackendOnly # Backend only
.\dev.ps1 -FrontendOnly # Frontend only
```

### Deployment Script (`deploy.ps1`)

```powershell
.\deploy.ps1           # Full deployment
.\deploy.ps1 -BuildOnly # Build only
.\deploy.ps1 -StartOnly # Start only
.\deploy.ps1 -Stop      # Stop PM2 processes
.\deploy.ps1 -Restart   # Restart PM2 processes
.\deploy.ps1 -Status    # View status
.\deploy.ps1 -Logs      # View logs
```

## Summary

✅ **PM2 Integration Complete**

- Development mode with PM2 support
- Production deployment with PM2
- Process management and monitoring
- Auto-restart on crashes
- Log management
- Cluster mode support

**Files:**
- `ecosystem.config.cjs` - Development config
- `ecosystem.production.config.cjs` - Production config
- `dev.ps1` - Development script (PM2 support)
- `deploy.ps1` - Deployment script (PM2 integration)

