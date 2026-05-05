#!/usr/bin/env pnpm zx

console.log(`
📋 Available Scripts

🔨 Build Commands:
  ./bin/build.ts         Build the application for production
  ./bin/clean.ts         Clean build artifacts and cache files

🚀 Development Commands:
  ./bin/dev.ts           Start development server with hot reloading
  ./bin/start.ts         Start production server (requires build first)

🔍 Code Quality Commands:
  ./bin/lint.ts          Run oxlint on the codebase
  ./bin/format.ts        Format code with oxfmt
  ./bin/ts-check.ts      Run TypeScript type checking
  ./bin/ts-check.ts --watch  Run TypeScript type checking in watch mode

🧪 Test Commands:
  ./bin/test.ts              Run all tests (unit + e2e)
  ./bin/test-vitest.ts       Run unit tests with Vitest
  ./bin/test-vitest.ts --watch  Run unit tests in watch mode
  ./bin/test-e2e.ts          Run e2e tests with database setup
  ./bin/test-e2e.ts --ui     Run e2e tests with Playwright UI

🚀 Deployment Commands:
  ./bin/validate-env.ts  Validate environment configuration

🤖 CI/CD Commands:
  ./bin/ci.ts           Run full CI pipeline (lint, type-check, test)

💡 Usage Examples:
  ./bin/dev.ts                    # Start development
  ./bin/build.ts && ./bin/start.ts   # Build and start production
  ./bin/test-vitest.ts --watch    # Develop with tests running
  ./bin/ci.ts                     # Run before committing
`);
