import { codegenEnvTypes } from "./helpers/varlock-codegen.ts";
import { loadEnv } from "./helpers/env.ts";

loadEnv();

await codegenEnvTypes();

console.log("🔨 Building TanStack Start application...");

$.stdio = "inherit";
await $`pnpm vite build`;

console.log("✅ Build completed successfully!");
console.log("📁 Build files are in: .output/");
