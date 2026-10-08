#!/usr/bin/env -S bun --preload zx/globals

console.log(`
📋 Available Scripts

🔨 Build Commands:
  bun run build              Build the application for production
  bun run build:prod         Migrate + build (production deploy)
  bun run clean              Clean build artifacts and cache files

🚀 Development Commands:
  bun run dev                Start development server with hot reloading
  bun run start              Start production server (requires build first)

🔍 Code Quality Commands:
  bun run lint               Run oxlint on the codebase
  bun run lint --fix         Run oxlint with auto-fix
  bun run format             Format code with oxfmt
  bun run format --check     Check formatting without writing
  bun run ts-check           Run TypeScript type checking

🧪 Test Commands:
  bun run test               Run all tests (unit + e2e)
  bun run test:vitest        Run unit tests with Vitest
  bun run test:vitest --watch  Run unit tests in watch mode
  bun run test:e2e           Run e2e tests with database setup
  bun run test:e2e --ui      Run e2e tests with Playwright UI
  bun run test:e2e:setup     Install Playwright browsers and migrate test DB

🗄️  Database Commands:
  bun run db generate        Generate migration from schema changes
  bun run db migrate         Apply pending migrations
  bun run db studio          Open Drizzle Studio UI
  bun run db:reset --force-reset <database-name>
                          Reset a local, non-production DB. Remote DBs require
                          --allow-remote-reset and interactive verification

🌿 Worktree Commands:
  bun run worktree create <name>  Create and provision a new worktree
  bun run worktree setup          Provision an already-created worktree
  bun run worktree list           List worktrees and configuration issues
  bun run worktree delete <name>  Remove a worktree and its database

🤖 CI/CD Commands:
  bun run ci                 Run full CI pipeline (lint, type-check, test)
  bun run validate-env       Validate environment configuration

💡 Usage Examples:
  bun run dev                          # Start development
  bun run build && bun run start          # Build and start production
  bun run test:vitest --watch          # Develop with tests running
  bun run ci                           # Run before committing
`);
