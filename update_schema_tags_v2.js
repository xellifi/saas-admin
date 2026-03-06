
import mysql from 'mysql2/promise';

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'saas_dashboard',
    });

    try {
        console.log('Adding tags column to online_store_products...');
        await connection.query(`
      ALTER TABLE online_store_products 
      ADD COLUMN IF NOT EXISTS tags TEXT AFTER brand;
    `);
        console.log('Successfully updated schema.');
    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await connection.end();
    }
}

updateSchema();
