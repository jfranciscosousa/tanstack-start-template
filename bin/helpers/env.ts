import dotenv from "dotenv";

export function loadEnv() {
  if (process.env.CI) return;

  if (process.env.NODE_ENV === "production") return;

  const file = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
  const { parsed } = dotenv.config({ path: file, quiet: true });

  console.log(
    `Loaded environment from ${file} | ${Object.keys(parsed ?? {}).length} variables loaded`
  );
}
