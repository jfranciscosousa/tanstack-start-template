#!/usr/bin/env -S bun --preload zx/globals

import { existsSync } from "fs";

import { loadEnv } from "./helpers/env.ts";

process.env.NODE_ENV = "test";
process.env.APP_ENV ??= "test";

if (!process.env.CI && !existsSync(".env.test")) {
  console.error(
    "❌ .env.test not found. Copy .env.test.sample to .env.test and configure it."
  );
  process.exit(1);
}

await loadEnv();

const args = process.argv.slice(2);
const useUI = args.includes("--ui");
const filteredArgs = args.filter(arg => arg !== "--ui");

const playwrightArgs = [useUI ? "--ui" : "", ...filteredArgs].filter(Boolean);
console.log(`> playwright test ${playwrightArgs.join(" ")}`);

$.stdio = "inherit";
await $`bun run test:e2e:setup`;
await $`bun run playwright test ${playwrightArgs}`;
