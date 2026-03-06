import { mysqlTable, serial, varchar, text, int, timestamp, index, mysqlEnum } from 'drizzle-orm/mysql-core';
import { pgTable, serial as pgSerial, varchar as pgVarchar, text as pgText, integer as pgInteger, timestamp as pgTimestamp, index as pgIndex, pgEnum } from 'drizzle-orm/pg-core';

const dialect = process.env.DB_DIALECT || 'mysql';

export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);

export const supportTickets = dialect === 'mysql'
  ? mysqlTable('support_tickets', {
    id: serial('id').primaryKey(),
    ticketNumber: varchar('ticket_number', { length: 20 }).notNull().unique(),
    userId: int('user_id').notNull(),
    subject: varchar('subject', { length: 200 }).notNull(),
    description: text('description').notNull(),
    status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).notNull().default('open'),
    priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent']).notNull().default('medium'),
    category: varchar('category', { length: 50 }).notNull().default('general'),
    assignedTo: int('assigned_to'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    resolvedAt: timestamp('resolved_at'),
  }, (table) => ({
    ticketNumberIdx: index('idx_ticket_number').on(table.ticketNumber),
    userIdIdx: index('idx_user_id').on(table.userId),
    statusIdx: index('idx_status').on(table.status),
  }))
  : pgTable('support_tickets', {
    id: pgSerial('id').primaryKey(),
    ticket_number: pgVarchar('ticket_number', { length: 20 }).notNull().unique(),
    user_id: pgInteger('user_id').notNull(),
    subject: pgVarchar('subject', { length: 200 }).notNull(),
    description: pgText('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    priority: ticketPriorityEnum('priority').notNull().default('medium'),
    category: pgVarchar('category', { length: 50 }).notNull().default('general'),
    assigned_to: pgInteger('assigned_to'),
    created_at: pgTimestamp('created_at').notNull().defaultNow(),
    updated_at: pgTimestamp('updated_at').notNull().defaultNow(),
    resolved_at: pgTimestamp('resolved_at'),
  }, (table) => ({
    ticketNumberIdx: pgIndex('idx_ticket_number').on(table.ticket_number),
    userIdIdx: pgIndex('idx_user_id').on(table.user_id),
    statusIdx: pgIndex('idx_status').on(table.status),
  }));

export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;
