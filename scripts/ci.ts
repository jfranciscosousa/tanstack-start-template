#!/usr/scripts/env pnpm zx

process.env.NODE_ENV = "test";

$.stdio = "inherit";

console.log("🤖 Running CI pipeline...");

console.log("🔍 Running type checks...");
await $`scripts/ts-check.ts`;

console.log("🎭 Installing Playwright browsers...");
await $`pnpm exec playwright install chromium`;

console.log("🧪 Running all tests...");
await $`scripts/test.ts`;

console.log("✅ CI pipeline completed successfully!");
