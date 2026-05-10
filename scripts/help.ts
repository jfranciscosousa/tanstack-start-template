#!/usr/scripts/env pnpm zx

console.log(`
📋 Available Scripts

🔨 Build Commands:
  ./scripts/build.ts         Build the application for production
  ./scripts/clean.ts         Clean build artifacts and cache files

🚀 Development Commands:
  ./scripts/dev.ts           Start development server with hot reloading
  ./scripts/start.ts         Start production server (requires build first)

🔍 Code Quality Commands:
  ./scripts/lint.ts          Run oxlint on the codebase
  ./scripts/format.ts        Format code with oxfmt
  ./scripts/ts-check.ts      Run TypeScript type checking
  ./scripts/ts-check.ts --watch  Run TypeScript type checking in watch mode

🧪 Test Commands:
  ./scripts/test.ts              Run all tests (unit + e2e)
  ./scripts/test-vitest.ts       Run unit tests with Vitest
  ./scripts/test-vitest.ts --watch  Run unit tests in watch mode
  ./scripts/test-e2e.ts          Run e2e tests with database setup
  ./scripts/test-e2e.ts --ui     Run e2e tests with Playwright UI

🚀 Deployment Commands:
  ./scripts/validate-env.ts  Validate environment configuration

🤖 CI/CD Commands:
  ./scripts/ci.ts           Run full CI pipeline (lint, type-check, test)

💡 Usage Examples:
  ./scripts/dev.ts                    # Start development
  ./scripts/build.ts && ./scripts/start.ts   # Build and start production
  ./scripts/test-vitest.ts --watch    # Develop with tests running
  ./scripts/ci.ts                     # Run before committing
`);
