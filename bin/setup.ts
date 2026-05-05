#!/usr/bin/env pnpm zx

const TEMPLATE_NAME = "my-tanstack-starter";

console.log("🚀 Setting up TanStack Start project...");

// Prompt for app name
let app_name = await question(`App name [${TEMPLATE_NAME}]: `);
app_name = app_name || TEMPLATE_NAME;

// Rename app in all relevant files if a new name was given
if (app_name !== TEMPLATE_NAME) {
  console.log(`✏️  Renaming app to '${app_name}'...`);
  await $`sed -i '' "s|${TEMPLATE_NAME}|${app_name}|g" README.md`;
  await $`sed -i '' "s|${TEMPLATE_NAME}|${app_name}|g" src/routes/__root.tsx`;
  console.log("✅ App renamed");
}

// Copy environment files
console.log("\n📄 Copying environment files...");
await $`cp .env.sample .env`;
await $`cp .env.test.sample .env.test`;

// Prompt for database configuration
console.log("\n📦 Database Configuration");
console.log(
  "Two databases will be created: <database-name>_dev and <database-name>_test\n"
);

const db_user = await question("PostgreSQL username: ");
const db_password = await question("PostgreSQL password: ");
const db_host =
  (await question("PostgreSQL host [localhost]: ")) || "localhost";
const db_port = (await question("PostgreSQL port [5432]: ")) || "5432";
let db_name = await question(`Database name [${app_name}]: `);
db_name = db_name || app_name;

if (!db_user || !db_name) {
  console.error("❌ Username and database name are required");
  process.exit(1);
}

// Construct database URLs
const dev_db_name = `${db_name}_dev`;
const test_db_name = `${db_name}_test`;

const base = db_password
  ? `postgresql://${db_user}:${db_password}@${db_host}:${db_port}`
  : `postgresql://${db_user}@${db_host}:${db_port}`;
const dev_db_url = `${base}/${dev_db_name}`;
const test_db_url = `${base}/${test_db_name}`;

// Update .env files with database URLs
await $`sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=${dev_db_url}|g" .env`;
await $`sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=${test_db_url}|g" .env.test`;

console.log("✅ Environment files configured with database URLs");

// Install dependencies
console.log("\n📦 Installing dependencies...");
await $`pnpm install`;
await $`pnpm exec playwright install chromium`;

// Apply database schema
console.log("\n🗄️  Setting up databases...");
console.log(`Creating development database: ${dev_db_name}`);
await $`createdb "${dev_db_name}" 2>/dev/null || echo "   Database ${dev_db_name} already exists (or createdb failed)"`;

console.log(`Creating test database: ${test_db_name}`);
await $`createdb "${test_db_name}" 2>/dev/null || echo "   Database ${test_db_name} already exists (or createdb failed)"`;

console.log("Applying migrations to development database...");
await $`pnpm drizzle-kit migrate`;

console.log("Applying migrations to test database...");
await $`DATABASE_URL="${test_db_url}" pnpm drizzle-kit migrate`;

console.log(`\n🎉 Setup complete! Your project '${app_name}' is ready to go:`);
console.log("   ✅ Dependencies installed");
console.log("   ✅ Environment files configured");
console.log(`   ✅ Development database created: ${dev_db_name}`);
console.log(`   ✅ Test database created: ${test_db_name}`);
console.log("   ✅ Database schemas applied");
console.log("\nNext steps:");
console.log("   - Run 'bin/dev.ts' to start the development server");
console.log("   - Run 'bin/test.ts' to run tests");
