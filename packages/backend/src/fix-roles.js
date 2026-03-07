const mysql = require('mysql2/promise');

async function fixRoles() {
    const dbConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'saas_dashboard',
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('--- Creating and Seeding Roles Table ---');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                permissions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table roles created');

        const roles = [
            {
                name: 'superadmin',
                description: 'Full system access',
                permissions: JSON.stringify(['*'])
            },
            {
                name: 'admin',
                description: 'Organization administrator',
                permissions: JSON.stringify(['dashboard.*', 'users.*', 'plans.view', 'addons.view', 'support.*'])
            },
            {
                name: 'user',
                description: 'Regular user',
                permissions: JSON.stringify(['dashboard.view', 'profile.*', 'support.create'])
            }
        ];

        for (const role of roles) {
            try {
                await connection.execute(
                    'INSERT IGNORE INTO roles (name, description, permissions) VALUES (?, ?, ?)',
                    [role.name, role.description, role.permissions]
                );
                console.log(`Seeded role: ${role.name}`);
            } catch (err) {
                console.error(`Failed to seed role ${role.name}: ${err.message}`);
            }
        }

        await connection.end();
        console.log('✅ Roles setup complete');
    } catch (err) {
        console.error('Failed to setup roles:', err.message);
    }
}

fixRoles();
