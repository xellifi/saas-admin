import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '', // Support both DB_PASS and DB_PASSWORD
  database: process.env.DB_NAME || 'saas_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false // Required for Aiven
  }
};

console.log('[DB Debug] Host:', dbConfig.host);
console.log('[DB Debug] User:', dbConfig.user);
console.log('[DB Debug] Database:', dbConfig.database);
console.log('[DB Debug] SSL Configured:', !!dbConfig.ssl);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute query with error handling
export const query = async (sql: string, params?: any[]) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get user by email with fallback connection
export const getUserByEmail = async (email: string) => {
  const sql = 'SELECT * FROM users WHERE email = ?';

  try {
    // Try pool connection first
    const rows = await query(sql, [email]) as any[];
    return rows[0] || null;
  } catch (error) {
    console.error('Pool connection failed, trying direct connection:', error);

    // Fallback to direct connection if pool fails
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'saas_dashboard',
        family: 4 // Force IPv4
      });

      const [rows] = await connection.execute(sql, [email]);
      await connection.end();

      return rows[0] || null;
    } catch (fallbackError) {
      console.error('Direct connection also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Get all users
export const getAllUsers = async () => {
  const sql = 'SELECT id, email, role, first_name, last_name, avatar, status, is_active, email_verified, last_login_at, created_at, updated_at FROM users ORDER BY created_at DESC';
  return await query(sql);
};

// Create user
export const createUser = async (userData: {
  email: string;
  hashedPassword: string;
  role: string;
  firstName?: string;
  lastName?: string;
  status?: string;
}) => {
  const sql = `
    INSERT INTO users (email, hashed_password, role, first_name, last_name, status, is_active, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)
  `;
  const result = await query(sql, [
    userData.email,
    userData.hashedPassword,
    userData.role,
    userData.firstName || '',
    userData.lastName || '',
    userData.status || 'active'
  ]);
  return result;
};

// Update user
export const updateUser = async (id: number, userData: Partial<{
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  status: string;
  is_active: boolean;
  email_verified: boolean;
  hashed_password?: string;
}>) => {
  const fields = [];
  const values = [];

  if (userData.email) {
    fields.push('email = ?');
    values.push(userData.email);
  }
  if (userData.role) {
    fields.push('role = ?');
    values.push(userData.role);
  }
  if (userData.first_name !== undefined) {
    fields.push('first_name = ?');
    values.push(userData.first_name);
  }
  if (userData.last_name !== undefined) {
    fields.push('last_name = ?');
    values.push(userData.last_name);
  }
  if (userData.status !== undefined) {
    fields.push('status = ?');
    values.push(userData.status);
  }
  if (userData.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(userData.is_active);
  }
  if (userData.email_verified !== undefined) {
    fields.push('email_verified = ?');
    values.push(userData.email_verified);
  }
  if (userData.hashed_password !== undefined) {
    fields.push('hashed_password = ?');
    values.push(userData.hashed_password);
  }

  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  return await query(sql, values);
};

// Delete user
export const deleteUser = async (id: number) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  return await query(sql, [id]);
};

// Update last login
export const updateLastLogin = async (id: number) => {
  const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
  return await query(sql, [id]);
};

// Get dashboard stats
export const getDashboardStats = async () => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as activeUsers,
      (SELECT COUNT(*) FROM plans WHERE is_active = TRUE) as totalPlans,
      (SELECT COUNT(*) FROM support_tickets WHERE status = 'open') as openTickets
  `;
  const rows = await query(sql) as any[];
  return rows[0] || {};
};

// Get support tickets
export const getSupportTickets = async () => {
  const sql = `
    SELECT st.*, u.first_name, u.last_name, u.email
    FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    ORDER BY st.created_at DESC
  `;
  return await query(sql);
};

// Get plans
export const getPlans = async () => {
  const sql = 'SELECT * FROM plans WHERE is_active = TRUE ORDER BY price ASC';
  return await query(sql);
};

// Get addons
export const getAddons = async () => {
  const sql = 'SELECT * FROM addons ORDER BY name';
  return await query(sql);
};

// Get settings
export const getSettings = async () => {
  const sql = 'SELECT * FROM settings ORDER BY key_name';
  return await query(sql);
};

// --- Role Helpers ---

// Get all roles
export const getRoles = async () => {
  const sql = 'SELECT * FROM roles ORDER BY name';
  return await query(sql);
};

// Get a single role by name
export const getRoleByName = async (name: string) => {
  const sql = 'SELECT * FROM roles WHERE name = ? LIMIT 1';
  const rows = await query(sql, [name]) as any[];
  return rows[0] || null;
};

// Create a new role
export const createRole = async (roleData: {
  name: string;
  description: string;
  permissions: any;
}) => {
  const sql = 'INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)';
  return await query(sql, [
    roleData.name,
    roleData.description,
    JSON.stringify(roleData.permissions)
  ]);
};

// Update a role
export const updateRole = async (id: number, roleData: Partial<{
  name: string;
  description: string;
  permissions: any;
}>) => {
  const fields = [];
  const values = [];

  if (roleData.name) {
    fields.push('name = ?');
    values.push(roleData.name);
  }
  if (roleData.description !== undefined) {
    fields.push('description = ?');
    values.push(roleData.description);
  }
  if (roleData.permissions) {
    fields.push('permissions = ?');
    values.push(JSON.stringify(roleData.permissions));
  }

  if (fields.length === 0) return null;

  values.push(id);
  const sql = `UPDATE roles SET ${fields.join(', ')} WHERE id = ?`;
  return await query(sql, values);
};

// Delete a role
export const deleteRole = async (id: number) => {
  const sql = 'DELETE FROM roles WHERE id = ?';
  return await query(sql, [id]);
};

// Update or create setting
export const upsertSetting = async (key: string, value: string, category: string = 'general', isPublic: boolean = false) => {
  const sql = `
    INSERT INTO settings (key_name, value, category, is_public) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE value = ?, category = ?, is_public = ?
  `;
  return await query(sql, [key, value, category, isPublic, value, category, isPublic]);
};

// --- Support Ticket Helpers ---

// Create a new support ticket
export const createTicket = async (ticketData: {
  userId: number;
  subject: string;
  description: string;
  priority: string;
  category: string;
}) => {
  const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const sql = `
    INSERT INTO support_tickets (ticket_number, user_id, subject, description, message, status, priority, category)
    VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
  `;
  return await query(sql, [
    ticketNumber,
    ticketData.userId,
    ticketData.subject,
    ticketData.description,
    ticketData.description, // duplicated to 'message' for compatibility
    ticketData.priority,
    ticketData.category
  ]);
};

// Add a reply to a ticket
export const addTicketReply = async (replyData: {
  ticketId: number;
  userId: number;
  message: string;
  isInternal?: boolean;
}) => {
  const sql = `
    INSERT INTO support_ticket_replies (ticket_id, user_id, message, is_internal)
    VALUES (?, ?, ?, ?)
  `;
  const result = await query(sql, [
    replyData.ticketId,
    replyData.userId,
    replyData.message,
    replyData.isInternal ? 1 : 0
  ]);

  // Update ticket's updated_at timestamp
  await query('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [replyData.ticketId]);

  return result;
};

// Get a single ticket with its replies
export const getTicketWithReplies = async (ticketId: number) => {
  const ticketSql = `
    SELECT st.*, u.first_name, u.last_name, u.email,
           a.first_name as assigned_first_name, a.last_name as assigned_last_name
    FROM support_tickets st
    LEFT JOIN users u ON st.user_id = u.id
    LEFT JOIN users a ON st.assigned_to = a.id
    WHERE st.id = ?
  `;

  const repliesSql = `
    SELECT str.*, u.first_name, u.last_name, u.role, u.avatar
    FROM support_ticket_replies str
    LEFT JOIN users u ON str.user_id = u.id
    WHERE str.ticket_id = ?
    ORDER BY str.created_at ASC
  `;

  const tickets = await query(ticketSql, [ticketId]) as any[];
  const replies = await query(repliesSql, [ticketId]) as any[];

  if (tickets.length === 0) return null;

  return {
    ...tickets[0],
    replies
  };
};

// Update ticket status
export const updateTicketStatus = async (ticketId: number, status: string) => {
  let sql = 'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP';
  const params: any[] = [status];

  if (status === 'resolved' || status === 'closed') {
    sql += ', resolved_at = CURRENT_TIMESTAMP';
  }

  sql += ' WHERE id = ?';
  params.push(ticketId);

  return await query(sql, params);
};

export default pool;
