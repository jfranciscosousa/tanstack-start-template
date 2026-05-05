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

$.stdio = "inherit";
await $`pnpm exec playwright install chromium`;
await $`bin/db-reset.ts`;
console.log("✅ End-to-end dependencies set up successfully!");
