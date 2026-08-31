process.env.NODE_ENV = "test";

$.stdio = "inherit";

console.log("🤖 Running CI pipeline...");

console.log("🔍 Running type checks...");
await $`pnpm ts-check`;

console.log("🎭 Installing Playwright browsers...");
await $`pnpm exec playwright install chromium`;

console.log("🧪 Running all tests...");
await $`pnpm test`;

console.log("✅ CI pipeline completed successfully!");
