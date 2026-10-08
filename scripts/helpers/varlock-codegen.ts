export async function codegenEnvTypes() {
  await $`bun run varlock codegen`;
  console.log("✅ Env types generated (env.d.ts)");
}
