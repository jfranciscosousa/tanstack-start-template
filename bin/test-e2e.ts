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
const useUI = args.includes("--ui");
const filteredArgs = args.filter(arg => arg !== "--ui");

const playwrightArgs = [useUI ? "--ui" : "", ...filteredArgs].filter(Boolean);
console.log(`> playwright test ${playwrightArgs.join(" ")}`);

$.stdio = "inherit";
await $`bin/test-e2e-setup.ts`;
await $`pnpm exec playwright test ${playwrightArgs}`;
