#!/usr/bin/env pnpm zx

import { existsSync } from "fs";

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const SERVER_FILE = ".output/server/index.mjs";

if (!existsSync(SERVER_FILE)) {
  console.error(`❌ Server file not found: ${SERVER_FILE}`);
  console.log(
    "💡 Run 'NITRO_PRESET=node_server bin/build.ts' first to build the application"
  );
  process.exit(1);
}

console.log("🚀 Starting production server...");

$.stdio = "inherit";
await $`node .output/server/index.mjs`;
