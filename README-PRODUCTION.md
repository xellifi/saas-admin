# SaaS Dashboard - Production-Ready Monorepo

A complete, production-ready SaaS Admin Dashboard with modular addon system, built with modern technologies and best practices.

## 🚀 Features

### Core Features
- **Monorepo Structure** - Clean workspace management with npm workspaces
- **Modular Addon System** - ZIP-based addon installation and management
- **Multi-Database Support** - MySQL and PostgreSQL with Drizzle ORM
- **Role-Based Access Control** - Superadmin, Admin, and User roles
- **Real-time Dashboard** - Live statistics and monitoring
- **File Upload System** - Secure file handling with size limits
- **Activity Logging** - Comprehensive audit trail
- **Email Notifications** - Built-in notification system

### Technical Features
- **TypeScript** - Full type safety across the stack
- **React 18** - Modern frontend with hooks and concurrent features
- **Fastify** - High-performance backend server
- **Tailwind CSS** - Utility-first styling system
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **Vite** - Fast development and build tooling

### Addon System
- **ZIP Upload/Install** - Easy addon distribution
- **Dynamic Route Loading** - Automatic route registration
- **Permission Management** - Granular addon permissions
- **Configuration System** - Flexible addon settings
- **Frontend Integration** - Seamless UI component loading

## 📁 Project Structure

```
saas-dashboard/
├── packages/
│   ├── backend/                 # Node.js + Fastify API
│   │   ├── src/
│   │   │   ├── server.ts       # Main server file
│   │   │   ├── routes/         # API routes
│   │   │   ├── utils/          # Utilities
│   │   │   └── db/             # Database setup
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                # React + Vite SPA
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   ├── pages/          # Page components
│       │   ├── stores/         # State management
│       │   ├── types/          # TypeScript types
│       │   └── main.tsx        # App entry point
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
├── addons/                      # Addon source files
│   ├── support-ticket-addon/    # Sample support ticket addon
│   └── crm-addon/              # Sample CRM addon
├── schema_mysql.sql             # MySQL database schema
├── schema_postgres.sql          # PostgreSQL database schema
├── seed_mysql.sql              # MySQL seed data
├── docker-compose.yml          # Docker configuration
├── ecosystem.config.js         # PM2 configuration
├── start-monorepo.bat          # Windows startup script
├── start-monorepo.sh           # Linux startup script
├── Dockerfile                  # Multi-stage Docker build
└── package.json                # Root monorepo config
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+ or PostgreSQL 14+
- npm 9+
- Git

### Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd saas-dashboard
npm install
```

2. **Database Setup**
```bash
# For MySQL
mysql -u root -p < schema_mysql.sql
mysql -u root -p < seed_mysql.sql

# For PostgreSQL
psql -U postgres < schema_postgres.sql
```

3. **Environment Configuration**
```bash
# Backend .env
cp packages/backend/.env.example packages/backend/.env
# Edit with your database credentials

# Frontend .env
cp packages/frontend/.env.example packages/frontend/.env
# Edit with your API URL
```

4. **Start Development**
```bash
# Windows
start-monorepo.bat

# Linux/Mac
chmod +x start-monorepo.sh
./start-monorepo.sh
```

### Manual Start
```bash
# Install dependencies
npm install

# Start backend
npm run dev:backend

# Start frontend (new terminal)
npm run dev:frontend
```

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@saas.com | SuperPass123! |
| Admin | admin@saas.com | AdminPass123! |
| User | user@saas.com | UserPass123! |

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d mysql redis
npm run dev
```

### Production
```bash
docker-compose --profile production up -d
```

### Database Selection
```bash
# MySQL (default)
docker-compose up -d

# PostgreSQL
docker-compose --profile postgres up -d
```

## 🚀 Production Deployment

### PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start production servers
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Restart
pm2 restart ecosystem.config.js
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saas_dashboard
DB_USER=saas_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=https://yourdomain.com
```

## 🔌 Addon Development

### Creating an Addon
1. Create addon directory in `addons/`
2. Add `package.json` with `saas-dashboard` metadata
3. Implement backend routes in `backend/index.js`
4. Add frontend components in `frontend/`
5. ZIP the addon directory
6. Upload via admin panel

### Addon Structure
```
my-addon/
├── package.json              # Addon metadata
├── backend/
│   └── index.js             # Fastify plugin
├── frontend/
│   ├── Component.jsx        # React components
│   └── styles.css          # Addon styles
└── assets/                  # Static files
```

### Addon Metadata
```json
{
  "saas-dashboard": {
    "displayName": "My Addon",
    "description": "Addon description",
    "category": "Category",
    "icon": "icon-name",
    "permissions": ["read:data", "write:data"],
    "routes": ["/api/my-addon"],
    "settings": {...}
  }
}
```

## 📊 API Documentation

### Authentication
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Core Endpoints
- `GET /api/users` - User management
- `GET /api/plans` - Subscription plans
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/settings` - System settings
- `GET /api/addons/installed` - Installed addons

### Addon Management
- `POST /api/addons/install` - Install addon from ZIP
- `DELETE /api/addons/:name/uninstall` - Uninstall addon
- `POST /api/addons/:name/toggle` - Enable/disable addon

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS protection
- File upload validation
- SQL injection prevention
- XSS protection
- Activity logging

## 📈 Performance

- Cluster mode with PM2
- Database connection pooling
- Response caching
- Image optimization
- Code splitting
- Lazy loading
- CDN ready

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📝 Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /` (serves SPA)

### Logging
- Structured JSON logging
- Log rotation
- Error tracking
- Performance metrics

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          npm ci
          npm run build
          pm2 reload ecosystem.config.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@saas-dashboard.com

## 🗺️ Roadmap

- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Plugin marketplace
- [ ] API rate limiting
- [ ] Webhook system
- [ ] Advanced permissions
- [ ] Theme system

---

**Built with ❤️ by the SaaS Dashboard Team**
