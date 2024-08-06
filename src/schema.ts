import { InferModel, sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Calendars
 */
 export const calendars = sqliteTable("calendars", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["quarter", "month", "week"] }).notNull().default("month"),
  firstPeriod: text("firstPeriod").notNull(), // Date
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  created: text('created')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Calendar = InferModel<typeof calendars>;

/**
 * Periods within a Calendar
 */
 export const periods = sqliteTable("periods", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),  
  start: text("start").notNull(),
  end: text("end").notNull(), 
  calendar: integer("calendar", { mode: "number" })
    .notNull()
    .references(() => calendars.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  created: text('created')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Period = InferModel<typeof calendars>;


/**
 * Employees
 */
export const employees = sqliteTable("employees", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  employeeId: text("employeeId").notNull(), 
  name: text("name").notNull(), 
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  started: text('started')
    .notNull()
    .default(sql`(CURRENT_DATE)`),
  finished: text('finished'),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  created: text('created')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Employee = InferModel<typeof employees>;

/**
 * Departments
 */
export const departments = sqliteTable("departments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), 
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  created: text('created')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Department = InferModel<typeof departments>;

/**
 * Teams
 */
export const teams = sqliteTable("teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), 
  department: integer("department", { mode: "number" })
    .notNull()
    .references(() => departments.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  created: text('created')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Department = InferModel<typeof departments>;


/**
 * Task List
 */
export const todos = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export type Todo = InferModel<typeof todos>;


/**
 * Core User Model
 */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
});

export const session = sqliteTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  activeExpires: blob("active_expires", {
    mode: "bigint",
  }).notNull(),
  idleExpires: blob("idle_expires", {
    mode: "bigint",
  }).notNull(),
});

export const key = sqliteTable("user_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hashedPassword: text("hashed_password"),
});
