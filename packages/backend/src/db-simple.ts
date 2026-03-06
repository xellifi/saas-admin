import mysql from 'mysql2/promise';

// Simple MySQL connection for demo
export const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'saas_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection() {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
