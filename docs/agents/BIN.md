# Bin Scripts

## Development

| Script         | What it does                                                                   |
| -------------- | ------------------------------------------------------------------------------ |
| `bin/dev.ts`   | Start dev server at `http://localhost:3000`                                    |
| `bin/build.ts` | Production build → `.output/`                                                  |
| `bin/start.ts` | Start production server (requires `bin/build.ts` first)                        |
| `bin/setup.ts` | First-time setup: copies `.env` files, installs deps, creates and migrates DBs |
| `bin/clean.ts` | Remove build artifacts, cache, `node_modules`, test results                    |

## Code Quality

| Script                    | What it does                       |
| ------------------------- | ---------------------------------- |
| `bin/ts-check.ts`         | TypeScript check (whole project)   |
| `bin/ts-check.ts --watch` | TypeScript check in watch mode     |
| `bin/lint.ts`             | oxlint — passes args through       |
| `bin/format.ts`           | oxfmt format — passes args through |

## Testing

| Script                              | What it does                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `bin/test.ts`                       | All tests: unit + e2e                                   |
| `bin/test-vitest.ts [file]`         | Unit tests; pass a file path to run a single file       |
| `bin/test-vitest.ts --watch [file]` | Unit tests in watch mode; accepts vitest args           |
| `bin/test-e2e.ts [args]`            | E2E tests (runs setup first); passes args to Playwright |
| `bin/test-e2e.ts --ui`              | E2E tests with Playwright UI mode                       |
| `bin/test-e2e-setup.ts`             | Installs Playwright browsers and migrates test DB       |

Examples:

```bash
bin/test-vitest.ts src/server/__tests__/userHandlers.node.test.ts
bin/test-vitest.ts --watch src/components/__tests__/
bin/test-e2e.ts --headed
bin/test-e2e.ts src/test/e2e/authentication.test.ts
```

## Database

| Script               | What it does                           |
| -------------------- | -------------------------------------- |
| `bin/db.ts generate` | Generate migration from schema changes |
| `bin/db.ts migrate`  | Apply pending migrations               |
| `bin/db.ts studio`   | Open Drizzle Studio UI                 |

All `bin/db.ts` commands forward args to `drizzle-kit` and load `.env` automatically.

## CI / Deployment

| Script                | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `bin/ci.ts`           | Full CI pipeline: type-check → install Playwright → all tests |
| `bin/build.ts`        | Build + migrate (for production deploys)                      |
| `bin/validate-env.ts` | Validate environment configuration                            |

## Internals (don't call directly)

| Script               | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `bin/helpers/env.ts` | Loads `.env` / `.env.test` automatically |

## Environment loading

Scripts automatically load the right env file:

- Most scripts: `.env`
- `test-*.ts` scripts: `.env.test` (falls back to `.env` if missing)

Environment is loaded only once per shell session — subsequent calls skip re-loading.
