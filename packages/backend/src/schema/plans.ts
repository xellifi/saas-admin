import { mysqlTable, serial, varchar, decimal, boolean, json, timestamp, index, int } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, decimal as pgDecimal, boolean as pgBoolean, json as pgJson, timestamp as pgTimestamp, index as pgIndex, integer as pgInteger } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const plans = dialect === 'mysql'
  ? mysqlTable('plans', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    billingCycle: varchar('billing_cycle', { length: 20 }).notNull().default('monthly'),
    features: json('features').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    maxUsers: int('max_users').default(1),
    maxStorage: int('max_storage').default(1000),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  }, (table) => ({
    nameIdx: index('idx_name').on(table.name),
    activeIdx: index('idx_active').on(table.isActive),
  }))
  : pgTable('plans', {
    id: pgSerial('id').primaryKey(),
    name: pgVarchar('name', { length: 100 }).notNull(),
    description: pgVarchar('description', { length: 500 }),
    price: pgDecimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
    currency: pgVarchar('currency', { length: 3 }).notNull().default('USD'),
    billing_cycle: pgVarchar('billing_cycle', { length: 20 }).notNull().default('monthly'),
    features: pgJson('features').notNull(),
    is_active: pgBoolean('is_active').notNull().default(true),
    max_users: pgInteger('max_users').default(1),
    max_storage: pgInteger('max_storage').default(1000),
    created_at: pgTimestamp('created_at').notNull().defaultNow(),
    updated_at: pgTimestamp('updated_at').notNull().defaultNow(),
  }, (table) => ({
    nameIdx: pgIndex('idx_name').on(table.name),
    activeIdx: pgIndex('idx_active').on(table.is_active),
  }));

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
