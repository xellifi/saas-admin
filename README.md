# Admin Dashboard SaaS Platform

A modern, full-stack SaaS admin dashboard built with React, Node.js, Fastify, TypeScript, and MySQL/PostgreSQL. Features role-based access control, user management, an addon system, subscription plans, and comprehensive analytics. It is structured as an **Optimized Monorepo** for clean separation of concerns and lightning-fast installations.

## 🚀 Features

### Core Features
- **Monorepo Structure**: Clean workspace management with npm workspaces. Single `node_modules` for zero bloat.
- **Authentication & Authorization**: JWT-based auth with refresh tokens.
- **Role-Based Access Control**: Super Admin, Admin, Supervisor, Support, User, Auditor, Guest roles with granular JSON permissions.
- **User & Subscription Management**: Complete CRUD operations, bulk actions, search, and flexible pricing plans.
- **Modular Addon System**: Upload, install, and manage third-party addons dynamically via ZIP.
- **Multi-Database Support**: MySQL and PostgreSQL via Drizzle ORM.
- **Dashboard Analytics**: Real-time metrics and KPIs.
- **Support System**: Ticket-based customer support.
- **File Upload System**: Secure file handling with validation.

### Technical & Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query
- **Backend**: Node.js, Fastify, TypeScript, Drizzle ORM
- **Infrastructure**: Docker multi-stage builds, PM2 ecosystem, Nginx configurations
- **Security**: Rate limiting, CORS, security headers, SQL injection prevention, content security policies.

---

## 📁 Monorepo Structure

```
admin-dashboard-saas/
├── package.json                 # Root workspace config
├── node_modules/                # SINGLE node_modules for all packages
├── packages/
│   ├── frontend/                # React + Vite + TypeScript (@saas-dashboard/frontend)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── backend/                 # Node.js + Fastify API (@saas-dashboard/backend)
│       ├── src/
│       ├── package.json
│       └── drizzle.config.ts
├── complete_setup.sql           # Complete MySQL database schema + seed data
├── schema_postgres.sql          # PostgreSQL database schema
├── docker-compose.yml           # Docker configuration
├── ecosystem.config.js          # PM2 configuration
└── start-monorepo.bat / .sh     # Quick start scripts
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+ or PostgreSQL 14+
- npm 9+

### 1. Database Setup

Create the database and run the unified setup script (for MySQL):
```bash
mysql -u root -p
CREATE DATABASE saas_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

mysql -u root -p saas_dashboard < complete_setup.sql
```
*(If using PostgreSQL, import `schema_postgres.sql` instead).*

### 2. Environment Configuration

Copy the `.env.example` files to `.env` in both packages.

**Backend (`packages/backend/.env`)**:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saas_dashboard
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-super-secret-key
PORT=3001
NODE_ENV=development
```

**Frontend (`packages/frontend/.env`)**:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Install & Start Development

Because this is a monorepo, you only need to run `npm install` once in the root!

```bash
# 1. Install all dependencies across all packages
npm install

# 2. Start the development servers
# Option A: Use the startup script
./start-monorepo.sh   # Linux/Mac
start-monorepo.bat    # Windows

# Option B: Run npm scripts
npm run dev
```

Server endpoints:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### 4. Default Login Credentials (from complete_setup.sql)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@saas.com | SuperPass123! |
| Admin | admin@saas.com | AdminPass123! |
| User | user@saas.com | UserPass123! |

---

## 📋 Available Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build            # Build both packages

# Monorepo specific (Run in specific workspace)
npm run dev --workspace=@saas-dashboard/frontend
# Install dependency for specific package
npm install axios --workspace=@saas-dashboard/frontend
```

---

## 🚀 Production Deployment

### Regular Deployment via PM2
```bash
# Install PM2
npm install -g pm2

# Build all packages
npm run build

# Start production servers
pm2 start ecosystem.config.js --env production

# Save PM2 configuration to run on startup
pm2 save
pm2 startup
```

### Docker Deployment
```bash
# Development (with DB)
docker-compose up -d mysql redis
npm run dev

# Production
docker-compose --profile production up -d --build
```

---

## 🔌 Addon Development System

1. Create a directory inside `addons/` (e.g., `addons/my-addon/`).
2. Add a `package.json` with the required `saas-dashboard` metadata block.
3. Structure backend hooks in `backend/index.js` and frontend views in `frontend/`.
4. ZIP the addon directory and upload it directly via the Admin Dashboard UI.

**Required package.json metadata:**
```json
{
  "saas-dashboard": {
    "displayName": "My Addon",
    "description": "Addon description",
    "category": "Category",
    "version": "1.0.0",
    "main": "./backend/index.js"
  }
}
```

---

## 📝 License

This project is licensed under the MIT License.
