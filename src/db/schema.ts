import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["voluntario", "coordenacao", "lider", "pastor"]);
export const checklistKind = pgEnum("checklist_kind", ["montagem", "desmontagem"]);
export const severity = pgEnum("severity", ["baixa", "media", "alta"]);
export const problemStatus = pgEnum("problem_status", ["aberto", "resolvido"]);
export const activityType = pgEnum("activity_type", [
  "check",
  "uncheck",
  "checklist_concluido",
  "problema",
  "resolvido",
  "comunicado",
  "culto",
  "escala",
  "sistema",
  "privacidade",
]);

/** Equipe de serviço: voluntários e gestão (pastor, líder, coordenação). */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("voluntario"),
    defaultFunction: varchar("default_function", { length: 60 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // LGPD: aceite do aviso de privacidade (versão e momento), pedido de exclusão e anonimização
    privacyAcceptedAt: timestamp("privacy_accepted_at", { withTimezone: true }),
    privacyVersion: varchar("privacy_version", { length: 20 }),
    deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

/** Um culto/evento com transmissão. Os checklists e a escala pertencem a um culto. */
export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 80 }).notNull(),
    date: date("date").notNull(),
    time: varchar("time", { length: 5 }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("services_date_idx").on(t.date)],
);

/** Escala: quem está servindo em qual função naquele culto. */
export const assignments = pgTable(
  "assignments",
  {
    serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    function: varchar("function", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.userId] })],
);

/** Modelo dos checklists (editável pela gestão). */
export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: checklistKind("kind").notNull(),
    group: varchar("group", { length: 40 }).notNull(),
    label: varchar("label", { length: 140 }).notNull(),
    position: integer("position").notNull().default(0),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("checklist_items_kind_idx").on(t.kind, t.position)],
);

/** Marcação de um item em um culto específico. */
export const checks = pgTable(
  "checks",
  {
    serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").notNull().references(() => checklistItems.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.itemId] })],
);

export const problems = pgTable(
  "problems",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    title: varchar("title", { length: 100 }).notNull(),
    description: text("description"),
    severity: severity("severity").notNull().default("media"),
    status: problemStatus("status").notNull().default("aberto"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),
  },
  (t) => [index("problems_status_idx").on(t.status, t.createdAt)],
);

export const notices = pgTable(
  "notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    body: text("body").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notices_created_idx").on(t.createdAt)],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: activityType("type").notNull(),
    message: varchar("message", { length: 240 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activities_created_idx").on(t.createdAt)],
);

export const usersRelations = relations(users, ({ many }) => ({ assignments: many(assignments) }));
export const servicesRelations = relations(services, ({ many }) => ({
  assignments: many(assignments),
  checks: many(checks),
}));
export const assignmentsRelations = relations(assignments, ({ one }) => ({
  user: one(users, { fields: [assignments.userId], references: [users.id] }),
  service: one(services, { fields: [assignments.serviceId], references: [services.id] }),
}));
export const checksRelations = relations(checks, ({ one }) => ({
  user: one(users, { fields: [checks.userId], references: [users.id] }),
  item: one(checklistItems, { fields: [checks.itemId], references: [checklistItems.id] }),
  service: one(services, { fields: [checks.serviceId], references: [services.id] }),
}));
export const problemsRelations = relations(problems, ({ one }) => ({
  author: one(users, { fields: [problems.createdBy], references: [users.id], relationName: "author" }),
  resolver: one(users, { fields: [problems.resolvedBy], references: [users.id], relationName: "resolver" }),
}));
export const noticesRelations = relations(notices, ({ one }) => ({
  author: one(users, { fields: [notices.createdBy], references: [users.id] }),
}));
export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type Service = typeof services.$inferSelect;
export type ChecklistKind = (typeof checklistKind.enumValues)[number];
export type Severity = (typeof severity.enumValues)[number];
export type ActivityType = (typeof activityType.enumValues)[number];
