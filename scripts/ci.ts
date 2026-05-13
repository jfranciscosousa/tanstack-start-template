process.env.NODE_ENV = "test";

$.stdio = "inherit";

console.log("🤖 Running CI pipeline...");

console.log("🔍 Running type checks...");
await $`zx scripts/ts-check.ts`;

console.log("🎭 Installing Playwright browsers...");
await $`pnpm exec playwright install chromium`;

console.log("🧪 Running all tests...");
await $`zx scripts/test.ts`;

console.log("✅ CI pipeline completed successfully!");
