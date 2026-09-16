// Validates environment configuration via Varlock (.env.schema).
// Usage: pnpm validate-env
// Override per command: APP_ENV=production pnpm validate-env

$.stdio = "inherit";

await $`pnpm exec varlock load`;
