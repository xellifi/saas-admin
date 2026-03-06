module.exports = {
  apps: [
    {
      name: 'saas-backend',
      script: 'packages/backend/dist/server.js',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        DB_DIALECT: 'mysql',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'saas_dashboard',
        DB_USER: 'saas_user',
        DB_PASSWORD: 'saas_password',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        CORS_ORIGIN: 'http://localhost:3000',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
        UPLOAD_MAX_SIZE: 52428800
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      health_check_grace_period: 3000
    },
    {
      name: 'saas-frontend',
      script: 'serve',
      args: '-s packages/frontend/dist -l 3000',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      env_development: {
        NODE_ENV: 'development'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '5s',
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 4000,
      kill_timeout: 3000
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/saas-dashboard.git',
      path: '/var/www/saas-dashboard',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/saas-dashboard.git',
      path: '/var/www/saas-dashboard-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
