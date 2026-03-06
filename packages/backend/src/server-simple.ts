import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import path from 'path';
import { testConnection } from './db-simple';
import addonRoutes from './routes/addons-simple';

const server = fastify({
  logger: true,
});

// Register plugins
server.register(cors, {
  origin: ['http://localhost:3000'],
  credentials: true,
});

server.register(helmet);
server.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
});

// Serve static files
server.register(staticPlugin, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API Routes
server.register(addonRoutes, { prefix: '/api' });

// Simple auth routes
server.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any;
  
  // Mock authentication
  if (email === 'superadmin@saas.com' && password === 'admin123') {
    return {
      user: {
        id: 1,
        email: 'superadmin@saas.com',
        role: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin'
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  }
  
  if (email === 'admin@saas.com' && password === 'admin123') {
    return {
      user: {
        id: 2,
        email: 'admin@saas.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  }
  
  if (email === 'user@saas.com' && password === 'admin123') {
    return {
      user: {
        id: 3,
        email: 'user@saas.com',
        role: 'user',
        firstName: 'Regular',
        lastName: 'User'
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  }
  
  return reply.status(401).send({ error: 'Invalid credentials' });
});

server.get('/api/auth/profile', async (request, reply) => {
  // Mock profile
  return {
    user: {
      id: 1,
      email: 'superadmin@saas.com',
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin'
    }
  };
});

// Mock data routes
server.get('/api/users', async () => {
  return {
    users: [
      {
        id: 1,
        email: 'superadmin@saas.com',
        role: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        email: 'admin@saas.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        email: 'user@saas.com',
        role: 'user',
        firstName: 'Regular',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString()
      }
    ],
    total: 3,
    page: 1,
    limit: 10
  };
});

server.get('/api/plans', async () => {
  return {
    plans: [
      {
        id: 1,
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          users: 1,
          storage: 1000,
          support: 'email',
          analytics: false,
          apiAccess: false,
          customBranding: false
        },
        isActive: true,
        maxUsers: 1,
        maxStorage: 1000,
        currentUsers: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Starter',
        description: 'Great for small teams',
        price: 9,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          users: 5,
          storage: 10000,
          support: 'email_priority',
          analytics: true,
          apiAccess: true,
          customBranding: false
        },
        isActive: true,
        maxUsers: 5,
        maxStorage: 10000,
        currentUsers: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Pro',
        description: 'Advanced features for growing businesses',
        price: 29,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          users: 20,
          storage: 100000,
          support: '24/7_chat',
          analytics: true,
          apiAccess: true,
          customBranding: true,
          advancedReports: true
        },
        isActive: true,
        maxUsers: 20,
        maxStorage: 100000,
        currentUsers: 8,
        createdAt: new Date().toISOString()
      }
    ]
  };
});

server.get('/api/support/tickets', async () => {
  return {
    tickets: [
      {
        id: 1,
        ticketNumber: 'SUP-2024-001',
        subject: 'Login issues with mobile app',
        description: 'Users are reporting authentication failures when trying to log in through the mobile application.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        userId: 1,
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        assignedTo: 2,
        assignedToName: 'Support Agent',
        createdAt: new Date('2024-03-01T10:30:00Z').toISOString(),
        updatedAt: new Date('2024-03-01T14:45:00Z').toISOString(),
        resolvedAt: null
      }
    ]
  };
});

// Dashboard stats
server.get('/api/dashboard/stats', async () => {
  return {
    stats: {
      totalUsers: 1234,
      activeUsers: 856,
      totalRevenue: 45678,
      monthlyGrowth: 12.5,
      newUsersThisMonth: 89,
      activeSubscriptions: 234,
      supportTickets: 45,
      openTickets: 12
    }
  };
});

const start = async () => {
  try {
    // Test database connection
    await testConnection();
    
    const port = process.env.PORT || 3001;
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📊 API docs available at http://localhost:${port}/health`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
