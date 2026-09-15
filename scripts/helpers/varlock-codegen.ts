export async function codegenEnvTypes() {
  await $`pnpm exec varlock codegen`;
  console.log("✅ Env types generated (env.d.ts)");
}
