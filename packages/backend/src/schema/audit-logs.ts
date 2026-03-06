import { mysqlTable, serial, varchar, text, int, json, timestamp, index, mysqlEnum } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, text as pgText, integer as pgInteger, json as pgJson, timestamp as pgTimestamp, index as pgIndex, pgEnum } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const auditActionEnum = pgEnum('audit_action', ['create', 'read', 'update', 'delete', 'login', 'logout', 'upload']);

export const auditLogs = dialect === 'mysql'
  ? mysqlTable('audit_logs', {
    id: serial('id').primaryKey(),
    userId: int('user_id'),
    action: mysqlEnum('action', ['create', 'read', 'update', 'delete', 'login', 'logout', 'upload']).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: int('resource_id'),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }, (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    actionIdx: index('idx_action').on(table.action),
    resourceIdx: index('idx_resource').on(table.resource),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
  }))
  : pgTable('audit_logs', {
    id: pgSerial('id').primaryKey(),
    user_id: pgInteger('user_id'),
    action: auditActionEnum('action').notNull(),
    resource: pgVarchar('resource', { length: 100 }).notNull(),
    resource_id: pgInteger('resource_id'),
    old_values: pgJson('old_values'),
    new_values: pgJson('new_values'),
    ip_address: pgVarchar('ip_address', { length: 45 }),
    user_agent: pgText('user_agent'),
    created_at: pgTimestamp('created_at').notNull().defaultNow(),
  }, (table) => ({
    userIdIdx: pgIndex('idx_user_id').on(table.user_id),
    actionIdx: pgIndex('idx_action').on(table.action),
    resourceIdx: pgIndex('idx_resource').on(table.resource),
    createdAtIdx: pgIndex('idx_created_at').on(table.created_at),
  }));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
