#!/usr/bin/env -S bun --preload zx/globals

import { existsSync } from "fs";

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

$.stdio = "inherit";
await $`bun .output/server/index.mjs`;
