#!/usr/bin/env pnpm zx

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const DEFAULT_PATHS = ["src", "bin"];

const args = process.argv.slice(3);
const hasPath = args.some(arg => !arg.startsWith("-"));
const paths = hasPath ? [] : DEFAULT_PATHS;

const allArgs = [...paths, ...args].filter(Boolean);
console.log(`> oxfmt ${allArgs.join(" ")}`);

$.stdio = "inherit";
await $`pnpm exec oxfmt ${allArgs}`;
