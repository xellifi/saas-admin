import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function onInstall({ db, accountId }) {
    console.log(`[Online Store Addon] Installing for account ${accountId}...`);

    // Run Migration
    const migrationPath = path.join(__dirname, 'migrations', '001_create_online_store_tables.sql');
    if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf-8');
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
        for (let stmt of statements) {
            try {
                if (db.query) {
                    await db.query(stmt);
                } else if (db.execute) {
                    await db.execute(stmt);
                }
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.error('Migration error:', err);
                }
            }
        }
    }

    // Seed default settings for the tenant
    try {
        const checkQuery = `SELECT * FROM online_store_settings WHERE account_id = ?`;
        const existing = await db.query ? await db.query(checkQuery, [accountId]) : await db.execute(checkQuery, [accountId]);

        let hasSettings = false;
        if (Array.isArray(existing) && existing.length > 0) hasSettings = true;
        if (existing && existing.rows && existing.rows.length > 0) hasSettings = true;

        if (!hasSettings) {
            const seedQuery = `INSERT INTO online_store_settings (account_id, store_name, custom_domain, currency, enabled) 
                               VALUES (?, ?, ?, ?, ?)`;
            if (db.query) {
                await db.query(seedQuery, [accountId, `My Store ${accountId}`, null, 'USD', true]);
            } else if (db.execute) {
                await db.execute(seedQuery, [accountId, `My Store ${accountId}`, null, 'USD', true]);
            }
        }
        console.log(`[Online Store Addon] Default settings seeded for account ${accountId}.`);
    } catch (err) {
        console.error('Failed to seed settings:', err);
    }
}

export async function onUninstall({ db, accountId }) {
    console.log(`[Online Store Addon] Uninstalling and dropping tables...`);

    const cleanupQueries = [
        `DROP TABLE IF EXISTS online_store_products`,
        `DROP TABLE IF EXISTS online_store_orders`,
        `DROP TABLE IF EXISTS online_store_settings`
    ];

    for (let query of cleanupQueries) {
        try {
            if (db.query) await db.query(query);
            else if (db.execute) await db.execute(query);
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    }

    console.log(`[Online Store Addon] Tables dropped successfully.`);
}
