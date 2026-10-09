import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { Priority, Role, Status } from '@/lib/constants'

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().notNull().unique(),
  role: text().$type<Role>().notNull().default('employee'),
  team: text().notNull().default('Operations'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

// Password hashes live in their own table so they can never be returned by a
// query that loads a user (for example a ticket's requester).
export const credentials = pgTable('credentials', {
  userId: integer()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  passwordHash: text().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable(
  'sessions',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // Only a SHA-256 of the cookie token is stored, so a DB leak cannot be replayed as logins.
    tokenHash: text().notNull().unique(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

export const tickets = pgTable(
  'tickets',
  {
    // Starts at 1001 so tickets display as REQ-1001, REQ-1002, ...
    id: integer().primaryKey().generatedAlwaysAsIdentity({ startWith: 1001 }),
    title: text().notNull(),
    description: text().notNull().default(''),
    status: text().$type<Status>().notNull().default('Open'),
    priority: text().$type<Priority>().notNull().default('Medium'),
    team: text().notNull().default('Operations'),
    requesterId: integer()
      .notNull()
      .references(() => users.id),
    assigneeId: integer().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('tickets_status_idx').on(t.status),
    index('tickets_requester_idx').on(t.requesterId),
    index('tickets_assignee_idx').on(t.assigneeId),
  ],
)

export const comments = pgTable(
  'comments',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ticketId: integer()
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    authorId: integer()
      .notNull()
      .references(() => users.id),
    body: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('comments_ticket_idx').on(t.ticketId)],
)

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  requester: one(users, { fields: [tickets.requesterId], references: [users.id], relationName: 'requester' }),
  assignee: one(users, { fields: [tickets.assigneeId], references: [users.id], relationName: 'assignee' }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, { fields: [comments.ticketId], references: [tickets.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type Ticket = typeof tickets.$inferSelect
export type Comment = typeof comments.$inferSelect
