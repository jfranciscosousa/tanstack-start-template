import { envPreflight } from "./helpers/env-preflight.ts";

await envPreflight();

console.log("🔨 Building TanStack Start application...");

$.stdio = "inherit";
await $`bun run vite build`;

console.log("✅ Build completed successfully!");
console.log(
  `📁 Build files are in: ${process.env.NITRO_PRESET === "node_server" ? ".output/" : ".vercel/output/"}`
);
