import { loadEnv } from "./helpers/env.ts";

await loadEnv();

const args = process.argv.slice(2);

console.log(`🗄️  Running drizzle-kit ${args.join(" ")}...`);

$.stdio = "inherit";
await $`bun run drizzle-kit ${args}`;
