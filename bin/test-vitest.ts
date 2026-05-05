#!/usr/bin/env pnpm zx

import { existsSync } from "fs";

import { loadEnv } from "./helpers/env.ts";

process.env.NODE_ENV = "test";

if (!process.env.CI && !existsSync(".env.test")) {
  console.error(
    "❌ .env.test not found. Copy .env.test.sample to .env.test and configure it."
  );
  process.exit(1);
}

loadEnv();

const args = process.argv.slice(3);
const useWatch = args.includes("--watch");
const filteredArgs = args.filter(arg => arg !== "--watch");

const vitestArgs = [useWatch ? "" : "run", ...filteredArgs].filter(Boolean);
console.log(`> vitest ${vitestArgs.join(" ")}`);

$.stdio = "inherit";
await $`bin/db-reset.ts`;
await $`pnpm exec vitest ${vitestArgs}`;
