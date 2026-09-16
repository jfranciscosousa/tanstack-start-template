import { envPreflight } from "./helpers/env-preflight.ts";

await envPreflight();

console.log("🔨 Building TanStack Start application...");

$.stdio = "inherit";
await $`pnpm vite build`;

console.log("✅ Build completed successfully!");
console.log("📁 Build files are in: .output/");
