
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Adding tags column to online_store_products...');
        await connection.query(`
      ALTER TABLE online_store_products 
      ADD COLUMN IF NOT EXISTS tags TEXT AFTER brand;
    `);
        console.log('Successfully updated schema.');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAMES') {
            console.log('Column tags already exists.');
        } else {
            console.error('Error updating schema:', error);
        }
    } finally {
        await connection.end();
    }
}

updateSchema();
