import postgres from "postgres";
import { createInterface } from "node:readline/promises";

import { loadEnv } from "./helpers/env.ts";

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("❌ Refusing to reset a database in production.");
  process.exit(1);
}

const parsedDatabaseUrl = new URL(databaseUrl);
const databaseName = parsedDatabaseUrl.pathname.replace(/^\//, "");
const args = process.argv.slice(3);
const forceFlagIndex = args.indexOf("--force-reset");
const confirmedDatabaseName = args.at(forceFlagIndex + 1);
if (forceFlagIndex === -1 || confirmedDatabaseName !== databaseName) {
  console.error(
    `❌ Destructive reset requires: pnpm db:reset --force-reset ${databaseName}`
  );
  process.exit(1);
}

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
if (!localHosts.has(parsedDatabaseUrl.hostname)) {
  if (!args.includes("--allow-remote-reset")) {
    console.error(
      `❌ Remote database reset requires the --allow-remote-reset flag and manual terminal verification.`
    );
    process.exit(1);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(
      "❌ Remote database resets require an interactive terminal. Automation cannot approve them."
    );
    process.exit(1);
  }

  const verification = `reset ${databaseName} on ${parsedDatabaseUrl.hostname}`;
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await prompt.question(
    `⚠️  Remote database detected. Type '${verification}' to continue: `
  );
  prompt.close();

  if (answer !== verification) {
    console.error("❌ Manual verification failed. Database was not changed.");
    process.exit(1);
  }
}

const databaseLocation = new URL(databaseUrl);
databaseLocation.username = "";
databaseLocation.password = "";
databaseLocation.search = "";
databaseLocation.hash = "";
console.log(
  `⚠️  Dropping and recreating schemas in ${databaseLocation.toString()}`
);

const sql = postgres(databaseUrl);
await sql`DROP SCHEMA IF EXISTS public CASCADE`;
await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
await sql`CREATE SCHEMA public`;
await sql.end();

console.log("🗄️  Applying migrations with drizzle-kit...");
await $`pnpm drizzle-kit migrate`;

console.log("✅ Database reset complete!");
