#!/usr/bin/env pnpm zx

import postgres from "postgres";

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

console.log(
  `⚠️  Dropping and recreating the public schema... for ${databaseUrl}`
);

const sql = postgres(databaseUrl);
await sql`DROP SCHEMA IF EXISTS public CASCADE`;
await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
await sql`CREATE SCHEMA public`;
await sql.end();

console.log("🗄️  Applying migrations with drizzle-kit...");
await $`pnpm drizzle-kit migrate`;

console.log("✅ Database reset complete!");
