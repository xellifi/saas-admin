const mysql = require('mysql2/promise');

async function checkDb() {
    const dbConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'saas_dashboard',
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('--- Tables ---');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));

        console.log('\n--- DESCRIBE addons ---');
        try {
            const [columns] = await connection.execute('DESCRIBE addons');
            console.log(JSON.stringify(columns, null, 2));
        } catch (e) {
            console.log('Error describing addons:', e.message);
        }

        console.log('\n--- SELECT * FROM addons ---');
        try {
            const [rows] = await connection.execute('SELECT * FROM addons');
            console.log(JSON.stringify(rows, null, 2));
        } catch (e) {
            console.log('Error selecting addons:', e.message);
        }

        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

checkDb();
