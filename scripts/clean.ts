import { $ } from "bun";

console.log("🧹 Cleaning build artifacts and cache files...");

await $`rm -rf playwright-report build public/build .cache test-results .output .vercel/output .tanstack .nitro dist`;

console.log("✅ Clean completed successfully!");
