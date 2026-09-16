// Validates environment configuration via Varlock (.env.schema).
// Usage: pnpm validate-env [-- <varlock load flags>]
// Override per command: APP_ENV=production pnpm validate-env

$.stdio = "inherit";

const args = process.argv.slice(3).filter(arg => arg !== "--");

await $`pnpm exec varlock load ${args}`;
