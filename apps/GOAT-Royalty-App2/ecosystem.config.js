module.exports = {
  apps: [
    // ═══ MAIN WEB APP ═══
    {
      name: 'goat-royalty-web',
      script: 'npm',
      args: 'start -- -p 3002',
      cwd: '/root/GOAT-Royalty-App2',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/GOAT-Royalty-App2/logs/web-error.log',
      out_file: '/root/GOAT-Royalty-App2/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 5000,
      max_restarts: 10
    },
    // ═══ AUTOMATION ENGINE ═══
    {
      name: 'goat-automation',
      script: 'start-automation.js',
      cwd: '/root/GOAT-Royalty-App2/automation',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/root/GOAT-Royalty-App2/logs/automation-error.log',
      out_file: '/root/GOAT-Royalty-App2/logs/automation-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      cron_restart: '0 0 * * *'
    }
  ]
};