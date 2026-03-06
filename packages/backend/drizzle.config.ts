import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

const dialect = process.env.DB_DIALECT || 'mysql';

const baseConfig = {
  schema: './src/schema/*',
  out: './drizzle',
  verbose: true,
  strict: true,
};

export default {
  ...baseConfig,
  ...(dialect === 'mysql' ? {
    dialect: 'mysql',
    dbCredentials: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'saas_dashboard',
    },
  } : {
    dialect: 'postgresql',
    dbCredentials: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'saas_dashboard',
      ssl: false,
    },
  }),
} satisfies Config;
