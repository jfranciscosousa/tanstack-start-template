#!/usr/bin/env pnpm zx

import { existsSync } from "fs";

import { loadEnv } from "./helpers/env.ts";

process.env.NODE_ENV = "test";

if (!process.env.CI && !existsSync(".env.test")) {
  console.error(
    "❌ .env.test not found. Copy .env.test.sample to .env.test and configure it."
  );
  process.exit(1);
}

loadEnv();

console.log("🎭 Setting up end-to-end tests...");

const testDatabaseUrl = process.env.DATABASE_URL;
if (!testDatabaseUrl) throw new Error("DATABASE_URL is not set");
const testDatabaseName = new URL(testDatabaseUrl).pathname.replace(/^\//, "");

$.stdio = "inherit";
await $`pnpm exec playwright install chromium`;
await $`zx scripts/db.reset.ts --force-reset ${testDatabaseName}`;
console.log("✅ End-to-end dependencies set up successfully!");
