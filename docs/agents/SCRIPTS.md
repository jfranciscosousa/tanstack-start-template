# Scripts

All scripts live in `scripts/` and are available as `pnpm <name>` via package.json.

## Development

| Script             | pnpm shortcut | What it does                                                                   |
| ------------------ | ------------- | ------------------------------------------------------------------------------ |
| `scripts/dev.ts`   | `pnpm dev`    | Start dev server at `http://localhost:3000`                                    |
| `scripts/build.ts` | `pnpm build`  | Production build → `.output/`                                                  |
| `scripts/start.ts` | `pnpm start`  | Start production server (requires `pnpm build` first)                          |
| `scripts/setup.ts` | `pnpm setup`  | First-time setup: copies `.env` files, installs deps, creates and migrates DBs |
| `scripts/clean.ts` | `pnpm clean`  | Remove build artifacts, cache, test results                                    |

## Code Quality

| Script                        | pnpm shortcut         | What it does                                        |
| ----------------------------- | --------------------- | --------------------------------------------------- |
| `scripts/ts-check.ts`         | `pnpm ts-check`       | TypeScript check (whole project)                    |
| `scripts/ts-check.ts --watch` |                       | TypeScript check in watch mode                      |
| `scripts/lint.ts`             | `pnpm lint`           | oxlint on `src scripts` — passes extra args through |
| `scripts/lint.ts --fix`       | `pnpm lint --fix`     | oxlint with auto-fix                                |
| `scripts/format.ts`           | `pnpm format`         | oxfmt on `src scripts` — passes extra args through  |
| `scripts/format.ts --check`   | `pnpm format --check` | Check formatting without writing                    |

## Testing

| Script                                  | pnpm shortcut         | What it does                                            |
| --------------------------------------- | --------------------- | ------------------------------------------------------- |
| `scripts/test.ts`                       | `pnpm test`           | All tests: unit + e2e                                   |
| `scripts/test-vitest.ts [file]`         | `pnpm test:vitest`    | Unit tests; pass a file path to run a single file       |
| `scripts/test-vitest.ts --watch [file]` |                       | Unit tests in watch mode; accepts vitest args           |
| `scripts/test-e2e.ts [args]`            | `pnpm test:e2e`       | E2E tests (runs setup first); passes args to Playwright |
| `scripts/test-e2e.ts --ui`              |                       | E2E tests with Playwright UI mode                       |
| `scripts/test-e2e-setup.ts`             | `pnpm test:e2e:setup` | Installs Playwright browsers and migrates test DB       |

Examples:

```bash
pnpm test:vitest src/server/__tests__/userHandlers.node.test.ts
pnpm test:vitest --watch src/components/__tests__/
pnpm test:e2e --headed
pnpm test:e2e src/test/e2e/authentication.test.ts
```

## Database

| Script                   | pnpm shortcut      | What it does                           |
| ------------------------ | ------------------ | -------------------------------------- |
| `scripts/db.ts generate` | `pnpm db generate` | Generate migration from schema changes |
| `scripts/db.ts migrate`  | `pnpm db migrate`  | Apply pending migrations               |
| `scripts/db.ts studio`   | `pnpm db studio`   | Open Drizzle Studio UI                 |
| `scripts/db-reset.ts`    | `pnpm db:reset`    | Drop and recreate DB, then migrate     |

All `scripts/db.ts` commands forward args to `drizzle-kit` and load the right env automatically.

## CI / Deployment

| Script                    | pnpm shortcut       | What it does                                                  |
| ------------------------- | ------------------- | ------------------------------------------------------------- |
| `scripts/ci.ts`           | `pnpm ci`           | Full CI pipeline: type-check → install Playwright → all tests |
| `scripts/validate-env.ts` | `pnpm validate-env` | Validate environment configuration                            |

## Internals (don't call directly)

| Script                   | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `scripts/helpers/env.ts` | Loads `.env` or `.env.test` based on `NODE_ENV` |

## Environment loading

Scripts load the env file based on `NODE_ENV`:

- `NODE_ENV=development` (default): `.env`
- `NODE_ENV=test`: `.env.test`

Environment is loaded only once — subsequent calls in the same process are no-ops.
