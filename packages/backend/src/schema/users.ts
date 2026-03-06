import { mysqlTable, serial, varchar, timestamp, boolean, json, index, mysqlEnum } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, timestamp as pgTimestamp, boolean as pgBoolean, json as pgJson, index as pgIndex, pgEnum } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'user']);

export const users = dialect === 'mysql'
  ? mysqlTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
    role: mysqlEnum('role', ['superadmin', 'admin', 'user']).notNull().default('user'),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    avatar: varchar('avatar', { length: 500 }),
    isActive: boolean('is_active').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    metadata: json('metadata'),
  }, (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role),
    activeIdx: index('idx_users_active').on(table.isActive),
  }))
  : pgTable('users', {
    id: pgSerial('id').primaryKey(),
    email: pgVarchar('email', { length: 255 }).notNull().unique(),
    hashed_password: pgVarchar('hashed_password', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('user'),
    first_name: pgVarchar('first_name', { length: 100 }),
    last_name: pgVarchar('last_name', { length: 100 }),
    avatar: pgVarchar('avatar', { length: 500 }),
    is_active: pgBoolean('is_active').notNull().default(true),
    email_verified: pgBoolean('email_verified').notNull().default(false),
    last_login_at: pgTimestamp('last_login_at'),
    created_at: pgTimestamp('created_at').notNull().defaultNow(),
    updated_at: pgTimestamp('updated_at').notNull().defaultNow(),
    metadata: pgJson('metadata'),
  }, (table) => ({
    emailIdx: pgIndex('idx_users_email').on(table.email),
    roleIdx: pgIndex('idx_users_role').on(table.role),
    activeIdx: pgIndex('idx_users_active').on(table.is_active),
  }));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
