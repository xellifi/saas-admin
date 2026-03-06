import { mysqlTable, serial, varchar, boolean, json, timestamp, index } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, boolean as pgBoolean, json as pgJson, timestamp as pgTimestamp, index as pgIndex } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const addons = dialect === 'mysql'
  ? mysqlTable('addons', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    version: varchar('version', { length: 20 }).notNull(),
    description: varchar('description', { length: 500 }),
    author: varchar('author', { length: 100 }),
    manifest: json('manifest').notNull(),
    isEnabled: boolean('is_enabled').notNull().default(false),
    isInstalled: boolean('is_installed').notNull().default(false),
    installPath: varchar('install_path', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  }, (table) => ({
    nameIdx: index('idx_name').on(table.name),
    enabledIdx: index('idx_enabled').on(table.isEnabled),
  }))
  : pgTable('addons', {
    id: pgSerial('id').primaryKey(),
    name: pgVarchar('name', { length: 100 }).notNull(),
    version: pgVarchar('version', { length: 20 }).notNull(),
    description: pgVarchar('description', { length: 500 }),
    author: pgVarchar('author', { length: 100 }),
    manifest: pgJson('manifest').notNull(),
    isEnabled: pgBoolean('is_enabled').notNull().default(false),
    isInstalled: pgBoolean('is_installed').notNull().default(false),
    installPath: pgVarchar('install_path', { length: 500 }),
    createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    updatedAt: pgTimestamp('updated_at').notNull().defaultNow(),
  }, (table) => ({
    nameIdx: pgIndex('idx_name').on(table.name),
    enabledIdx: pgIndex('idx_enabled').on(table.isEnabled),
  }));

export type Addon = typeof addons.$inferSelect;
export type NewAddon = typeof addons.$inferInsert;
