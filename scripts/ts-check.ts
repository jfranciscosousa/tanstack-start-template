import { $ } from "bun";

import { codegenEnvTypes } from "./helpers/varlock-codegen.ts";

await codegenEnvTypes();

const args = process.argv.slice(2);
console.log(`> bun check --project tsconfig.json ${args.join(" ")}`);

await $`bun check --project tsconfig.json ${args}`;
await $`bun check --project scripts/tsconfig.json ${args}`;
console.log("✅ TypeScript check completed");
