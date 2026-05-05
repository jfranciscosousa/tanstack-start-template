#!/usr/bin/env pnpm zx

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const args = process.argv.slice(3);
const useWatch = args.includes("--watch");
const filteredArgs = args.filter(arg => arg !== "--watch");

const tscArgs = [
  "--project",
  "tsconfig.json",
  "--noEmit",
  "--skipLibCheck",
  useWatch ? "--watch" : "",
  ...filteredArgs,
].filter(Boolean);

console.log(`> tsc ${tscArgs.join(" ")}`);

$.stdio = "inherit";
await $`pnpm exec tsc ${tscArgs}`;
if (!useWatch) console.log("✅ TypeScript check completed");
