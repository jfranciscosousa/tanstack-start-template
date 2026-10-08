// Validates environment configuration via Varlock (.env.schema).
// Usage: bun run validate-env [-- <varlock load flags>]
// Override per command: APP_ENV=production bun run validate-env

$.stdio = "inherit";

const args = process.argv.slice(2).filter(arg => arg !== "--");

await $`bun run varlock load ${args}`;
