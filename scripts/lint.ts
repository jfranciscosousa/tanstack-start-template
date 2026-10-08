import { $ } from "bun";

const DEFAULT_PATHS = [
  "src",
  "scripts",
  "vite.config.ts",
  "vitest.config.ts",
  "playwright.config.ts",
  "drizzle.config.ts",
  "nitro.config.ts",
  "oxlint.config.ts",
];

const args = process.argv.slice(2);
const hasPath = args.some(arg => !arg.startsWith("-"));
const paths = hasPath ? [] : DEFAULT_PATHS;

const allArgs = ["--deny-warnings", ...paths, ...args].filter(Boolean);
console.log(`> oxlint ${allArgs.join(" ")}`);

await $`bun run oxlint ${allArgs}`;
