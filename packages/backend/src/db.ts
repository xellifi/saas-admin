import { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import * as schema from './schema';

const dialect = process.env.DB_DIALECT || 'mysql';

export const db = dialect === 'mysql'
  ? mysqlDrizzle(mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'saas_dashboard',
    connectionLimit: 10,
  }), { schema, mode: 'default' })
  : pgDrizzle(new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'saas_dashboard',
    max: 10,
  }), { schema, mode: 'default' });

export type Database = typeof db;
export * from './schema';
