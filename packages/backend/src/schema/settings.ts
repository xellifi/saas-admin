import { mysqlTable, serial, varchar, text, json, timestamp, index, boolean } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, text as pgText, json as pgJson, timestamp as pgTimestamp, index as pgIndex, boolean as pgBoolean } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const settings = dialect === 'mysql'
  ? mysqlTable('settings', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: text('value'),
    type: varchar('type', { length: 50 }).notNull().default('string'),
    category: varchar('category', { length: 50 }).notNull().default('general'),
    description: varchar('description', { length: 500 }),
    isPublic: boolean('is_public').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  }, (table) => ({
    keyIdx: index('idx_key').on(table.key),
    categoryIdx: index('idx_category').on(table.category),
  }))
  : pgTable('settings', {
    id: pgSerial('id').primaryKey(),
    key: pgVarchar('key', { length: 100 }).notNull().unique(),
    value: pgText('value'),
    type: pgVarchar('type', { length: 50 }).notNull().default('string'),
    category: pgVarchar('category', { length: 50 }).notNull().default('general'),
    description: pgVarchar('description', { length: 500 }),
    is_public: pgBoolean('is_public').notNull().default(false),
    created_at: pgTimestamp('created_at').notNull().defaultNow(),
    updated_at: pgTimestamp('updated_at').notNull().defaultNow(),
  }, (table) => ({
    keyIdx: pgIndex('idx_key').on(table.key),
    categoryIdx: pgIndex('idx_category').on(table.category),
  }));

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
