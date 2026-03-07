// @ts-nocheck
import fastify from 'fastify';
import path from 'path';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import jwt from '@fastify/jwt';
import { addonRoutes } from './routes/addons';
import { authenticate } from './middleware/auth';
import bcrypt from 'bcrypt';
import {
  testConnection,
  getUserByEmail,
  updateLastLogin,
  getAllUsers,
  getDashboardStats,
  getSupportTickets,
  getPlans,
  getAddons,
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getSettings,
  upsertSetting,
  query,
  createTicket,
  addTicketReply,
  getTicketWithReplies,
  updateTicketStatus
} from './database';
import { AddonManager } from './lib/addon-manager';
import { AddonWatcher } from './lib/addon-watcher';

const server = fastify({
  logger: true,
});

// Register multipart for addon uploads
server.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Register static for uploads
server.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/', // optional: default '/'
});

// Register JWT
server.register(jwt, {
  secret: process.env.JWT_SECRET || 'mySaaSsupersecret2026keychangeinprod'
});

// Test database connection on startup (non-blocking)
testConnection().then(connected => {
  if (!connected) {
    console.log('⚠️  Database not connected, but server will continue...');
  }
}).catch(error => {
  console.log('⚠️  Database test failed:', error.message);
});

// Enable CORS
server.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
});

// Handle OPTIONS
server.options('/*', async (request, reply) => {
  reply.send();
});

// Root route
server.get('/', async () => {
  return {
    message: 'Admin Dashboard API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      users: '/api/users',
      plans: '/api/plans',
      support: '/api/support/tickets',
      addons: '/api/addons',
      dashboard: '/api/dashboard/stats',
      settings: '/api/settings'
    }
  };
});

// Test database connection with actual query
server.get('/api/test/query', async (request, reply) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return {
      success: true,
      userCount: (result as any[])[0]?.count || 0,
      message: 'Database query working'
    };
  } catch (error) {
    console.error('Query test error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Database query failed',
      details: (error as Error).message
    });
  }
});

// Test user lookup with fallback
server.get('/api/test/user-fallback/:email', async (request, reply) => {
  try {
    const { email } = request.params as { email: string };
    const user = await getUserByEmail(email);

    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          email_verified: user.email_verified,
          hasHashedPassword: !!user.hashed_password
        }
      };
    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    console.error('User lookup error:', error);
    return reply.status(500).send({
      success: false,
      error: 'User lookup failed',
      details: (error as Error).message
    });
  }
});

// Simple connection test (bypass pool)
server.get('/api/test/simple', async (request, reply) => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'saas_dashboard'
    });

    await connection.ping();
    await connection.end();

    return {
      success: true,
      message: 'Simple connection successful'
    };
  } catch (error) {
    console.error('Simple connection error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Simple connection failed',
      details: (error as Error).message
    });
  }
});

// Simple MySQL connection test
server.get('/api/test/mysql', async (request, reply) => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'saas_dashboard'
    });

    await connection.ping();
    await connection.end();

    return {
      success: true,
      message: 'Direct MySQL connection successful'
    };
  } catch (error) {
    console.error('Direct MySQL test error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Direct MySQL connection failed',
      details: (error as Error).message
    });
  }
});

// Test user lookup endpoint
server.get('/api/test/user/:email', async (request, reply) => {
  try {
    const { email } = request.params as { email: string };
    const user = await getUserByEmail(email);

    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          email_verified: user.email_verified,
          hasHashedPassword: !!user.hashed_password
        }
      };
    } else {
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    console.error('User lookup error:', error);
    return reply.status(500).send({
      success: false,
      error: 'User lookup failed',
      details: (error as Error).message
    });
  }
});

// Test database endpoint
server.get('/api/test/db', async (request, reply) => {
  try {
    const result = await query('SELECT COUNT(*) as userCount FROM users');
    return {
      success: true,
      userCount: (result as any[])[0]?.userCount || 0,
      message: 'Database connection working'
    };
  } catch (error) {
    console.error('Database test error:', error);
    return reply.status(500).send({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.1-debug' };
});

// Auth routes
import { createUser, updateUser, deleteUser } from './database';
server.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as any;

  // Trim inputs and convert email to lowercase for consistency
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPassword = password?.trim();

  console.log('--- Login Attempt ---');
  console.log('Email:', cleanEmail);
  console.log('Password length:', cleanPassword?.length || 0);

  try {
    // Get user from database
    const user = await getUserByEmail(cleanEmail);

    if (!user) {
      console.log('❌ User not found in database:', cleanEmail);
      
      // Fallback to mock authentication for demo purposes
      const mockUsers = {
        'superadmin@saas.com': { id: 1, role: 'superadmin', firstName: 'Super', lastName: 'Admin' },
        'admin@saas.com': { id: 2, role: 'admin', firstName: 'Admin', lastName: 'User' },
        'user@saas.com': { id: 3, role: 'user', firstName: 'Regular', lastName: 'User' }
      };
      
      const mockUser = mockUsers[cleanEmail];
      if (mockUser && cleanPassword === 'admin123') {
        console.log('✅ Using mock authentication for:', cleanEmail);
        
        const token = server.jwt.sign({
          id: mockUser.id,
          email: cleanEmail,
          role: mockUser.role
        });
        
        return {
          success: true,
          data: {
            user: {
              id: mockUser.id,
              email: cleanEmail,
              role: mockUser.role,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              isActive: true,
              emailVerified: true,
              createdAt: new Date().toISOString()
            },
            accessToken: token,
            refreshToken: 'mock-refresh-token'
          }
        };
      }
      
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Support both snake_case (direct SQL) and camelCase (Drizzle) field names
    const storedHash = user.hashed_password || user.hashedPassword;
    const isActive = user.is_active !== undefined ? user.is_active : user.isActive;

    console.log('✅ User found. ID:', user.id);
    console.log('Status: Active=', isActive);
    console.log('Has Stored Hash:', !!storedHash);

    // Check if user is active
    if (!isActive) {
      console.log('❌ User is inactive');
      return reply.status(401).send({ error: 'Account is inactive' });
    }

    // Verify password
    if (!storedHash) {
      console.log('❌ No password hash found for user');
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(cleanPassword, storedHash);
    console.log('Password comparison result:', isValidPassword ? '✅ MATCH' : '❌ FAIL');

    if (!isValidPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Update last login
    await updateLastLogin(user.id);
    console.log('🚀 Login successful for:', cleanEmail);

    // Look up role permissions from roles table
    let permissions: Record<string, boolean> = {};
    try {
      const roleRow = await getRoleByName(user.role);
      if (roleRow && roleRow.permissions) {
        const parsed = typeof roleRow.permissions === 'string'
          ? JSON.parse(roleRow.permissions)
          : roleRow.permissions;
        permissions = parsed;
      }
    } catch (err) {
      console.warn('Could not load role permissions:', err);
    }

    // Generate real tokens
    const accessToken = server.jwt.sign({
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      type: 'access'
    }, { expiresIn: '7d' });

    const refreshToken = server.jwt.sign({
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      type: 'refresh'
    }, { expiresIn: '30d' });

    // Return user data (standardized fields for frontend)
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        isActive: !!isActive,
        emailVerified: !!(user.email_verified !== undefined ? user.email_verified : user.emailVerified),
        lastLoginAt: user.last_login_at || user.lastLoginAt,
        createdAt: user.created_at || user.createdAt,
        updatedAt: user.updated_at || user.updatedAt,
        permissions
      },
      token: accessToken,
      refreshToken: refreshToken
    };
  } catch (error) {
    console.error('Login error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
});

server.get('/api/auth/profile', {
  preHandler: [authenticate]
}, async (request, reply) => {
  try {
    const jwtUser = (request as any).user;
    if (!jwtUser) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    // Fetch fresh user data from database
    const dbUser = await getUserByEmail(jwtUser.email);
    if (!dbUser) {
      return reply.status(401).send({ error: 'User not found' });
    }

    // Look up role permissions
    let permissions: Record<string, boolean> = {};
    try {
      const roleRow = await getRoleByName(dbUser.role);
      if (roleRow && roleRow.permissions) {
        const parsed = typeof roleRow.permissions === 'string'
          ? JSON.parse(roleRow.permissions)
          : roleRow.permissions;
        permissions = parsed;
      }
    } catch (err) {
      console.warn('Could not load role permissions for profile:', err);
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        isActive: !!dbUser.is_active,
        emailVerified: !!dbUser.email_verified,
        lastLoginAt: dbUser.last_login_at,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at,
        permissions
      }
    };
  } catch (error) {
    console.error('Profile fetch error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Users route
server.get('/api/users', async (request, reply) => {
  try {
    const users = await getAllUsers();

    // Transform database data to match frontend format
    const formattedUsers = (users as any[]).map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      status: user.status,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    return {
      users: formattedUsers,
      total: formattedUsers.length,
      page: 1,
      limit: 10
    };
  } catch (error) {
    console.error('Get users error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.post('/api/users', async (request, reply) => {
  try {
    const { email, password, role, firstName, lastName } = request.body as any;

    if (!email || !password || !role) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await createUser({
      email,
      hashedPassword,
      role,
      firstName,
      lastName
    });

    return reply.status(201).send({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.put('/api/users/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const userData = request.body as any;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    // Transform frontend camelCase to snake_case for DB
    const dbData: any = {};
    if (userData.email) dbData.email = userData.email;
    if (userData.role) dbData.role = userData.role;
    if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
    if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
    if (userData.isActive !== undefined) dbData.is_active = userData.isActive;
    if (userData.emailVerified !== undefined) dbData.email_verified = userData.emailVerified;

    if (userData.password && userData.password.trim() !== '') {
      dbData.hashed_password = await bcrypt.hash(userData.password.trim(), 12);
    }

    await updateUser(userId, dbData);

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Update user error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

server.delete('/api/users/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    await deleteUser(userId);

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Plans route
server.get('/api/plans', async (request, reply) => {
  try {
    const plans = await getPlans();

    // Transform plans to match frontend expected format
    const formattedPlans = (plans as any[]).map((plan: any) => ({
      ...plan,
      isActive: plan.is_active, // Map is_active to isActive
      billingCycle: plan.billing_cycle, // Map billing_cycle to billingCycle
      maxUsers: plan.max_users, // Map max_users to maxUsers
      maxStorage: plan.max_storage, // Map max_storage to maxStorage
      features: plan.features ? JSON.parse(plan.features) : {}
    }));

    return {
      plans: formattedPlans,
      total: formattedPlans.length
    };
  } catch (error) {
    console.error('Get plans error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Delete plan route
server.delete('/api/plans/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const planId = parseInt(id);

    if (isNaN(planId)) {
      return reply.status(400).send({ error: 'Invalid plan ID' });
    }

    // Check if plan exists
    const existingPlan = await query('SELECT * FROM plans WHERE id = ?', [planId]);
    if (!existingPlan || (existingPlan as any[]).length === 0) {
      return reply.status(404).send({ error: 'Plan not found' });
    }

    // For now, allow deletion even if users exist (remove this check if needed)
    // In production, you might want to handle user reassignment first

    // Delete the plan
    await query('DELETE FROM plans WHERE id = ?', [planId]);

    return { success: true, message: 'Plan deleted successfully' };
  } catch (error) {
    console.error('Delete plan error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Support tickets route
server.get('/api/support/tickets', async (request, reply) => {
  try {
    const { userId, role } = request.query as any;

    let tickets;
    if (role === 'superadmin') {
      // Superadmins see all tickets
      tickets = await getSupportTickets();
    } else if (userId) {
      // Admins/Users see only their own tickets
      const sql = `
        SELECT st.*, u.first_name, u.last_name, u.email
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
        WHERE st.user_id = ?
        ORDER BY st.created_at DESC
      `;
      tickets = await query(sql, [userId]);
    } else {
      // Fallback for missing user context
      tickets = await getSupportTickets();
    }

    // Transform tickets to match frontend expected format
    const formattedTickets = (tickets as any[]).map((ticket: any) => ({
      ...ticket,
      resolvedAt: ticket.resolved_at,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at
    }));

    return { tickets: formattedTickets };
  } catch (error) {
    console.error('Get support tickets error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Create new support ticket
server.post('/api/support/tickets', async (request, reply) => {
  try {
    const { userId, subject, description, priority, category } = request.body as any;

    if (!userId || !subject || !description) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    await createTicket({
      userId,
      subject,
      description,
      priority: priority || 'medium',
      category: category || 'general'
    });

    return reply.status(201).send({ success: true, message: 'Ticket created successfully' });
  } catch (error) {
    console.error('Create ticket error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Get ticket with replies
server.get('/api/support/tickets/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return reply.status(400).send({ error: 'Invalid ticket ID' });
    }

    const ticketData = await getTicketWithReplies(ticketId);

    if (!ticketData) {
      return reply.status(404).send({ error: 'Ticket not found' });
    }

    return { ticket: ticketData };
  } catch (error) {
    console.error('Get ticket detail error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Add reply to ticket
server.post('/api/support/tickets/:id/replies', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { userId, message, isInternal } = request.body as any;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return reply.status(400).send({ error: 'Invalid ticket ID' });
    }

    if (!userId || !message) {
      return reply.status(400).send({ error: 'Missing userId or message' });
    }

    await addTicketReply({
      ticketId,
      userId,
      message,
      isInternal: !!isInternal
    });

    return reply.status(201).send({ success: true, message: 'Reply added successfully' });
  } catch (error) {
    console.error('Add reply error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Update ticket status
server.put('/api/support/tickets/:id/status', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { status } = request.body as any;
    const ticketId = parseInt(id);

    if (isNaN(ticketId) || !status) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    await updateTicketStatus(ticketId, status);

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    console.error('Update status error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Delete support ticket route
server.delete('/api/support/tickets/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return reply.status(400).send({ error: 'Invalid ticket ID' });
    }

    // Check if ticket exists
    const existingTicket = await query('SELECT * FROM support_tickets WHERE id = ?', [ticketId]);
    if (!existingTicket || (existingTicket as any[]).length === 0) {
      return reply.status(404).send({ error: 'Ticket not found' });
    }

    // Delete the ticket
    await query('DELETE FROM support_tickets WHERE id = ?', [ticketId]);

    return { success: true, message: 'Ticket deleted successfully' };
  } catch (error) {
    console.error('Delete ticket error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Addon management routes
server.register(addonRoutes, { prefix: '/api' });

// Addon engine will be initialized in start()

// 4. Start file watcher for hot reload (dev only)
AddonWatcher.start(server);

// Dashboard stats
server.get('/api/dashboard/stats', async (request, reply) => {
  try {
    const stats = await getDashboardStats();

    return {
      stats: {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        totalRevenue: 0, // This would need to be calculated from subscriptions
        monthlyGrowth: 12.5, // This would need to be calculated from historical data
        newUsersThisMonth: 0, // This would need to be calculated from user creation dates
        activeSubscriptions: 0, // This would need to be calculated from subscriptions
        supportTickets: stats.openTickets || 0,
        openTickets: stats.openTickets || 0
      }
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Settings route
server.get('/api/settings', async (request, reply) => {
  try {
    const settings = await getSettings();

    // Transform settings to key-value format
    const formattedSettings = (settings as any[]).reduce((acc: any, setting: any) => {
      acc[setting.key_name] = setting.value;
      return acc;
    }, {});

    return {
      settings: {
        siteName: formattedSettings.site_name || 'Admin Dashboard',
        siteDescription: formattedSettings.site_description || 'SaaS Admin Dashboard Platform',
        primaryColor: formattedSettings.primary_color || '#3B82F6',
        accentColor: formattedSettings.accent_color || '#10B981',
        emailNotifications: formattedSettings.email_notifications === 'true',
        pushNotifications: formattedSettings.push_notifications === 'true',
        // RBAC Settings
        accessAdminUsersEnabled: formattedSettings.access_admin_users_enabled !== 'false',
        accessAdminPlansEnabled: formattedSettings.access_admin_plans_enabled !== 'false',
        accessUserBillingEnabled: formattedSettings.access_user_billing_enabled !== 'false',
        accessUserSupportEnabled: formattedSettings.access_user_support_enabled !== 'false',
        accessAdminSettingsEnabled: formattedSettings.access_admin_settings_enabled !== 'false',
        // Integrations
        integration_google_drive: formattedSettings.integration_google_drive === 'true',
        integration_slack: formattedSettings.integration_slack === 'true',
        integration_notion: formattedSettings.integration_notion === 'true',
        integration_jira: formattedSettings.integration_jira === 'true',
        integration_zendesk: formattedSettings.integration_zendesk === 'true',
        integration_dropbox: formattedSettings.integration_dropbox === 'true',
        integration_github: formattedSettings.integration_github === 'true',
        integration_gitlab: formattedSettings.integration_gitlab === 'true',
        integration_figma: formattedSettings.integration_figma === 'true',
        integration_adobe_xd: formattedSettings.integration_adobe_xd === 'true',
        integration_sketch: formattedSettings.integration_sketch === 'true',
        integration_hubspot: formattedSettings.integration_hubspot === 'true',
        integration_zapier: formattedSettings.integration_zapier === 'true'
      }
    };
  } catch (error) {
    console.error('Get settings error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Update settings route
server.post('/api/settings', async (request, reply) => {
  try {
    const { settings: newSettings, userId } = request.body as any;

    // In a real app, verify user role from JWT
    // Here we'll do a simple check if userId is provided and we can get the user
    // (This is a simplified implementation as requested)

    // Convert camelCase to snake_case for DB
    const mapping: Record<string, string> = {
      siteName: 'site_name',
      siteDescription: 'site_description',
      primaryColor: 'primary_color',
      accentColor: 'accent_color',
      emailNotifications: 'email_notifications',
      pushNotifications: 'push_notifications',
      accessAdminUsersEnabled: 'access_admin_users_enabled',
      accessAdminPlansEnabled: 'access_admin_plans_enabled',
      accessUserBillingEnabled: 'access_user_billing_enabled',
      accessUserSupportEnabled: 'access_user_support_enabled',
      accessAdminSettingsEnabled: 'access_admin_settings_enabled',
      // Integrations
      integration_google_drive: 'integration_google_drive',
      integration_slack: 'integration_slack',
      integration_notion: 'integration_notion',
      integration_jira: 'integration_jira',
      integration_zendesk: 'integration_zendesk',
      integration_dropbox: 'integration_dropbox',
      integration_github: 'integration_github',
      integration_gitlab: 'integration_gitlab',
      integration_figma: 'integration_figma',
      integration_adobe_xd: 'integration_adobe_xd',
      integration_sketch: 'integration_sketch',
      integration_hubspot: 'integration_hubspot',
      integration_zapier: 'integration_zapier'
    };

    for (const [key, value] of Object.entries(newSettings)) {
      const dbKey = mapping[key];
      if (dbKey) {
        await upsertSetting(dbKey, String(value), 'general', false);
      }
    }

    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Update settings error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// --- Role Routes ---

// Get all roles
server.get('/api/roles', async (request, reply) => {
  try {
    const roles = await getRoles();
    // Parse permissions JSON safely
    const formattedRoles = (roles as any[]).map(role => {
      let permissions = role.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e: any) {
          console.error(`Error parsing permissions for role ${role.name}:`, e.message);
          permissions = {
            accessAdminUsersEnabled: false,
            accessAdminPlansEnabled: false,
            accessUserBillingEnabled: false,
            accessUserSupportEnabled: true,
            accessAdminSettingsEnabled: false
          };
        }
      }
      return { ...role, permissions };
    });
    return { roles: formattedRoles };
  } catch (error) {
    console.error('Get roles error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Create role
server.post('/api/roles', async (request, reply) => {
  try {
    const { name, description, permissions } = request.body as any;
    if (!name) return reply.status(400).send({ error: 'Role name is required' });

    await createRole({ name, description, permissions });
    return reply.status(201).send({ success: true, message: 'Role created successfully' });
  } catch (error) {
    console.error('Create role error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Update role
server.put('/api/roles/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { name, description, permissions } = request.body as any;
    const roleId = parseInt(id);

    if (isNaN(roleId)) return reply.status(400).send({ error: 'Invalid role ID' });

    await updateRole(roleId, { name, description, permissions });
    return { success: true, message: 'Role updated successfully' };
  } catch (error) {
    console.error('Update role error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Delete role
server.delete('/api/roles/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const roleId = parseInt(id);

    if (isNaN(roleId)) return reply.status(400).send({ error: 'Invalid role ID' });

    // Check if any users are using this role before deleting (simplified)
    // For now, let's just delete it
    await deleteRole(roleId);
    return { success: true, message: 'Role deleted successfully' };
  } catch (error) {
    console.error('Delete role error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Activity logs route
server.get('/api/activity/logs', async (request, reply) => {
  try {
    const limit = (request.query as any).limit || 10;
    const sql = `
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `;
    const logs = await query(sql, [limit]);

    // Transform logs to include user name
    const formattedLogs = (logs as any[]).map((log: any) => ({
      ...log,
      user_name: log.first_name && log.last_name ? `${log.first_name} ${log.last_name}` : log.email || 'System'
    }));

    return {
      logs: formattedLogs,
      total: formattedLogs.length
    };
  } catch (error) {
    console.error('Get activity logs error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

const start = async () => {
  try {
    // Test database connection (non-blocking)
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but server will continue...');
      console.warn('⚠️  Please check your database configuration');
    }

    // --- ADDON ENGINE STARTUP ---
    console.log('🚀 Initializing Addon Engine...');
    // 1. Ensure required tables exist
    await AddonManager.ensureAddonsTable();
    await AddonManager.ensureMigrationsTable();

    // 2. Share main DB connection with addon plugins
    AddonManager.shareDatabase(server);

    // 3. Auto-detect, sync, and register all addons
    await AddonManager.scanAndSyncAddons(server);
    console.log('✅ Addon engine: registration complete');

    // 4. Start file watcher for hot reload (dev only)
    AddonWatcher.start(server);

    // Run server
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port: port as number, host: '0.0.0.0' });
    console.log(`🚀 Server listening at http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${dbConnected ? '✅ Connected' : '❌ Disconnected'}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
