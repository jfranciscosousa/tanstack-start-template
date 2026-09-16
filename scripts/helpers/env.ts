// Loads and validates env via Varlock (.env.schema) into process.env.
// Set APP_ENV / NODE_ENV before calling. Dynamic import is intentional.
// Static `import "varlock/auto-load"` would hoist above those assignments.
// Hoisting would resolve the wrong environment, so keep the import lazy.
export async function loadEnv() {
  if (process.env.CI) return;

  if (process.env.NODE_ENV === "production") return;

  await import("varlock/auto-load");
}
