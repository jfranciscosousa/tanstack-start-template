#!/usr/bin/env pnpm zx

import { loadEnv } from "./helpers/env.ts";

loadEnv();

console.log("🧹 Cleaning build artifacts and cache files...");

await $`rm -rf
  playwright-report
  build
  public/build
  .cache
  test-results
  .output
  .tanstack
  .nitro
  dist`;

console.log("✅ Clean completed successfully!");
