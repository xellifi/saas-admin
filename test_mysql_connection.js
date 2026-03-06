const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing MySQL connection...');
  
  try {
    // Test 1: Direct connection
    console.log('\n1. Testing direct connection...');
    const connection1 = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'saas_dashboard',
      family: 4
    });
    
    await connection1.ping();
    console.log('✅ Direct connection successful');
    await connection1.end();
    
    // Test 2: Check if database exists
    console.log('\n2. Testing database existence...');
    const connection2 = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      family: 4
    });
    
    const [databases] = await connection2.execute('SHOW DATABASES');
    console.log('Available databases:', databases.map(db => db[0]));
    
    // Test 3: Check if saas_dashboard exists
    console.log('\n3. Testing saas_dashboard database...');
    const [tables] = await connection2.execute('SHOW TABLES FROM saas_dashboard');
    console.log('Tables in saas_dashboard:', tables.map(t => t[0]));
    
    // Test 4: Check if users table exists and has data
    console.log('\n4. Testing users table...');
    const [userCount] = await connection2.execute('SELECT COUNT(*) as count FROM saas_dashboard.users');
    console.log('User count:', userCount[0].count);
    
    if (userCount[0].count > 0) {
      const [users] = await connection2.execute('SELECT email, role FROM saas_dashboard.users LIMIT 3');
      console.log('Sample users:', users[0]);
    }
    
    await connection2.end();
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
