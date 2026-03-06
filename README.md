# Admin Dashboard SaaS Platform

A modern, full-stack SaaS admin dashboard built with React, Node.js, TypeScript, and MySQL. Features role-based access control, user management, addon system, subscription plans, and comprehensive analytics.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with refresh tokens, 2FA support
- **Role-Based Access Control**: Super Admin, Admin, User roles with granular permissions
- **User Management**: Complete CRUD operations with bulk actions and search
- **Dashboard Analytics**: Real-time metrics, charts, and KPI tracking
- **Modular Addon System**: Upload, install, and manage third-party addons
- **Subscription Plans**: Flexible pricing plans with feature management
- **Support System**: Ticket-based customer support with priority management
- **Settings Management**: Comprehensive configuration options

### Technical Features
- **Modern Tech Stack**: React 18, TypeScript, Node.js, MySQL, Redis
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: WebSocket support for live data
- **File Uploads**: Secure file handling with validation
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Security**: Rate limiting, CORS, security headers, input validation
- **Performance**: Caching, lazy loading, optimized builds
- **Deployment Ready**: Docker, PM2, Nginx configurations

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/admin-dashboard-saas.git
cd admin-dashboard-saas
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### 3. Environment Configuration

Create environment files:

**Backend (`.env`)**:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=admin_dashboard
DB_USER=admin
DB_PASSWORD=admin123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Upload
UPLOAD_MAX_SIZE=50mb

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (`.env`)**:
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### 4. Database Setup

```bash
# Create database and user
mysql -u root -p
CREATE DATABASE admin_dashboard;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON admin_dashboard.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;

# Import schema and seed data
mysql -u admin -p admin_dashboard < schema.sql
mysql -u admin -p admin_dashboard < seed.sql
```

### 5. Start Development Servers

```bash
# Start backend (in root directory)
npm run dev:backend

# Start frontend (in new terminal)
npm run dev:frontend
```

Or use the convenience script:
```bash
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
admin-dashboard-saas/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Server entry point
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # State management
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── main.tsx        # App entry point
│   ├── dist/               # Built assets
│   └── package.json
├── uploads/                # File uploads
├── logs/                   # Application logs
├── docker-compose.yml       # Docker configuration
├── Dockerfile             # Docker image
├── ecosystem.config.js    # PM2 configuration
├── .htaccess             # Apache configuration
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Linting
npm run lint             # Lint all code
npm run lint:frontend    # Lint frontend
npm run lint:backend     # Lint backend

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset database
```

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Static type checking

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Production Docker Build

```bash
# Build production image
docker build -t admin-dashboard .

# Run container
docker run -d \
  --name admin-dashboard \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  admin-dashboard
```

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/admin-dashboard/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and available at `/docs` when running the backend server.

### Key Endpoints

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Dashboard**: `/api/dashboard/*`
- **Addons**: `/api/addons/*`
- **Plans**: `/api/plans/*`
- **Support**: `/api/support/*`
- **Settings**: `/api/settings/*`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin resource sharing controls
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: OWASP recommended headers
- **File Upload Security**: Type and size validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage     # Test coverage report
```

### Frontend Testing

```bash
cd frontend
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Test coverage report
```

## 📈 Monitoring & Logging

### Application Logs

- **Access Logs**: HTTP request logs
- **Error Logs**: Application errors
- **Security Logs**: Authentication and authorization events
- **Performance Logs**: Response times and metrics

### Health Checks

- **Application Health**: `/health` endpoint
- **Database Health**: Database connectivity check
- **Redis Health**: Cache connectivity check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Use semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [FAQ](docs/FAQ.md)
2. Search existing [Issues](https://github.com/your-username/admin-dashboard-saas/issues)
3. Create a new [Issue](https://github.com/your-username/admin-dashboard-saas/issues/new)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Node.js](https://nodejs.org/) - Runtime environment
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Fastify](https://www.fastify.io/) - Web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Lucide](https://lucide.dev/) - Icon library
- [Recharts](https://recharts.org/) - Chart library

---

Built with ❤️ by [Your Name](https://github.com/your-username)
