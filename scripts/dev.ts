import { envPreflight } from "./helpers/env-preflight.ts";

await envPreflight();

$.stdio = "inherit";

const port = process.env.PORT ?? "3000";

console.log("🚀 Starting TanStack Start development server...");

// Prevents dev mode crash with git daemon
process.env.CHOKIDAR_USEPOLLING ??= "true";

await $`CHOKIDAR_USEPOLLING=true pnpm vite dev --port ${port}`;
