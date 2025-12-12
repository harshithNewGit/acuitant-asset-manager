// PM2 Production Ecosystem Configuration
// Backend only - serves API + static files from dist/

module.exports = {
  apps: [
    {
      name: 'asset-manager',
      script: './server PG/server.js',
      cwd: './',
      instances: 1, // Change to 'max' for cluster mode
      exec_mode: 'fork', // Change to 'cluster' for load balancing
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Graceful shutdown
      shutdown_with_message: true,
      // Health check
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};

