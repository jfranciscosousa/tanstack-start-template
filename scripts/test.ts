#!/usr/bin/env pnpm zx

import { existsSync } from "fs";

import { loadEnv } from "./helpers/env.ts";

process.env.NODE_ENV = "test";

$.stdio = "inherit";

if (!process.env.CI && !existsSync(".env.test")) {
  console.error(
    "❌ .env.test not found. Copy .env.test.sample to .env.test and configure it."
  );
  process.exit(1);
}

loadEnv();

console.log("🧪 Running all tests...");

console.log("📋 Running unit tests with Vitest...");
await $`pnpm test:vitest`;

console.log("🎭 Running end-to-end tests...");
await $`pnpm test:e2e`;

console.log("✅ All tests completed successfully!");
