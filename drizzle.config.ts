import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error("process.env.DATABASE_URL should exist");

export default defineConfig({
  dbCredentials: {
    url: DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/server/db/schema.ts",
  strict: true,
  verbose: true,
});
