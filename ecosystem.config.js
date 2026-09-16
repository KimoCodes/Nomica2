// PM2 Ecosystem Configuration for NomiTips
// Usage: pm2 start ecosystem.config.js
// Documentation: https://pm2.keymetrics.io/docs/usage/application-deployment/

module.exports = {
  apps: [
    {
      name: "nomitips",
      script: "./node_modules/.bin/tsx",
      args: "server.ts",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      // Restart configuration
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,

      // Memory management
      max_memory_restart: "1G",

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Watch (disabled in production)
      watch: false,

      // Instance management
      instances: 1, // Must be 1 for Socket.io
      exec_mode: "fork",
    },
  ],
};
