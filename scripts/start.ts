#!/usr/bin/env -S bun

import { existsSync } from "fs";
import { $ } from "bun";

import { loadEnv } from "./helpers/env.ts";

await loadEnv();

const SERVER_FILE = ".output/server/index.mjs";

if (!existsSync(SERVER_FILE)) {
  console.error(`❌ Server file not found: ${SERVER_FILE}`);
  console.log(
    "💡 Run 'NITRO_PRESET=node_server bun run build' first to build the application"
  );
  process.exit(1);
}

console.log("🚀 Starting production server...");

// Resolved-env injection can replace PORT with the build-time value.
process.env.NITRO_PORT ??= process.env.PORT ?? "3000";
await $`bun .output/server/index.mjs`;
