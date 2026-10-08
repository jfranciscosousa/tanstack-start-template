import { $ } from "bun";

process.env.NODE_ENV = "test";
process.env.APP_ENV ??= "test";

console.log("🤖 Running CI pipeline...");

console.log("🔍 Running lint and formatting checks...");
await $`bun run lint`;
await $`bun run format --check`;

console.log("🔍 Running type checks...");
await $`bun run ts-check`;

console.log("🔨 Building the application...");
await $`bun run build`;

console.log("🎭 Installing Playwright browsers...");
await $`bun run playwright install chromium`;

console.log("🧪 Running all tests...");
await $`bun run test`;

console.log("✅ CI pipeline completed successfully!");
