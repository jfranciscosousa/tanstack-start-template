#!/usr/bin/env -S bun

import { existsSync } from "fs";
import { $ } from "bun";

import { loadEnv } from "./helpers/env.ts";

process.env.NODE_ENV = "test";
process.env.APP_ENV ??= "test";

if (!process.env.CI && !existsSync(".env.test")) {
  console.error(
    "❌ .env.test not found. Copy .env.test.sample to .env.test and configure it."
  );
  process.exit(1);
}

await loadEnv();

console.log("🧪 Running all tests...");

console.log("📋 Running unit tests with Vitest...");
await $`bun run test:vitest`;

console.log("🎭 Running end-to-end tests...");
await $`bun run test:e2e`;

console.log("✅ All tests completed successfully!");
