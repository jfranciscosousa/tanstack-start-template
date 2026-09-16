import { codegenEnvTypes } from "./varlock-codegen.ts";
import { loadEnv } from "./env.ts";

export async function envPreflight() {
  await loadEnv();

  await codegenEnvTypes();
}
