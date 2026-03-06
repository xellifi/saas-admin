const mysql = require('mysql2/promise');

async function updateDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '12345678',
      database: 'saas_dashboard'
    });
    
    console.log('✅ Connected to database');
    
    // Update passwords for all users
    const passwordHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm';
    
    console.log('Updating user passwords...');
    
    // Update superadmin
    await connection.execute(
      'UPDATE users SET hashed_password = ? WHERE email = ?',
      [passwordHash, 'superadmin@saas.com']
    );
    
    // Update admin
    await connection.execute(
      'UPDATE users SET hashed_password = ? WHERE email = ?',
      [passwordHash, 'admin@saas.com']
    );
    
    // Update user
    await connection.execute(
      'UPDATE users SET hashed_password = ? WHERE email = ?',
      [passwordHash, 'user@saas.com']
    );
    
    // Verify updates
    console.log('Verifying updates...');
    const [users] = await connection.execute(
      'SELECT email, role, LEFT(hashed_password, 20) as password_preview FROM users WHERE email IN (?, ?, ?)',
      ['superadmin@saas.com', 'admin@saas.com', 'user@saas.com']
    );
    
    console.log('Updated users:');
    users.forEach(user => {
      console.log(`  ${user.email} (${user.role}): ${user.password_preview}...`);
    });
    
    // Test login credentials
    console.log('\n🎯 Login Credentials:');
    console.log('  superadmin@saas.com / 12345678');
    console.log('  admin@saas.com / 12345678');
    console.log('  user@saas.com / 12345678');
    
    await connection.end();
    console.log('\n✅ Database updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.error('Full error:', error);
  }
}

updateDatabase();
