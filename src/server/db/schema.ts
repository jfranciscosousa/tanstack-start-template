import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

// ---- better-auth tables ----

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  theme: text("theme", { enum: ["dark", "light"] })
    .notNull()
    .default("dark"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ---- Application tables ----

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  table => [index("todos_user_id_idx").on(table.userId)]
);

// ---- Relations ----

export const relations = defineRelations(
  { users, sessions, accounts, verifications, todos },
  relationBuilder => ({
    users: {
      sessions: relationBuilder.many.sessions(),
      accounts: relationBuilder.many.accounts(),
      todos: relationBuilder.many.todos(),
    },
    sessions: {
      user: relationBuilder.one.users({
        from: relationBuilder.sessions.userId,
        to: relationBuilder.users.id,
      }),
    },
    accounts: {
      user: relationBuilder.one.users({
        from: relationBuilder.accounts.userId,
        to: relationBuilder.users.id,
      }),
    },
    todos: {
      user: relationBuilder.one.users({
        from: relationBuilder.todos.userId,
        to: relationBuilder.users.id,
      }),
    },
  })
);

// ---- Type exports ----

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
export type Todo = typeof todos.$inferSelect;
