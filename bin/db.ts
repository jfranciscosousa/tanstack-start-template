#!/usr/bin/env pnpm zx

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const args = process.argv.slice(3);

console.log(`🗄️  Running drizzle-kit ${args.join(" ")}...`);

$.stdio = "inherit";
await $`pnpm drizzle-kit ${args}`;
