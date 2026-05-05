#!/usr/bin/env pnpm zx

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const port = process.env.PORT ?? "3000";

console.log("🚀 Starting TanStack Start development server...");

await $`pnpm vite dev --port ${port}`;
