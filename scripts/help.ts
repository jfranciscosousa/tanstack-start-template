#!/usr/bin/env pnpm zx

console.log(`
📋 Available Scripts

🔨 Build Commands:
  pnpm build              Build the application for production
  pnpm build:prod         Migrate + build (production deploy)
  pnpm clean              Clean build artifacts and cache files

🚀 Development Commands:
  pnpm dev                Start development server with hot reloading
  pnpm start              Start production server (requires build first)

🔍 Code Quality Commands:
  pnpm lint               Run oxlint on the codebase
  pnpm lint --fix         Run oxlint with auto-fix
  pnpm format             Format code with oxfmt
  pnpm format --check     Check formatting without writing
  pnpm ts-check           Run TypeScript type checking

🧪 Test Commands:
  pnpm test               Run all tests (unit + e2e)
  pnpm test:vitest        Run unit tests with Vitest
  pnpm test:vitest --watch  Run unit tests in watch mode
  pnpm test:e2e           Run e2e tests with database setup
  pnpm test:e2e --ui      Run e2e tests with Playwright UI
  pnpm test:e2e:setup     Install Playwright browsers and migrate test DB

🗄️  Database Commands:
  pnpm db generate        Generate migration from schema changes
  pnpm db migrate         Apply pending migrations
  pnpm db studio          Open Drizzle Studio UI
  pnpm db:reset           Drop and recreate DB, then migrate

🤖 CI/CD Commands:
  pnpm ci                 Run full CI pipeline (lint, type-check, test)
  pnpm validate-env       Validate environment configuration

💡 Usage Examples:
  pnpm dev                          # Start development
  pnpm build && pnpm start          # Build and start production
  pnpm test:vitest --watch          # Develop with tests running
  pnpm ci                           # Run before committing
`);
