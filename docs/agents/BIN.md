# Bin Scripts

All project operations go through `bin/` scripts. Never call `pnpm vite`, `pnpm vitest`, `pnpm playwright`, or `pnpm drizzle-kit` directly.

## Development

| Script | What it does |
|---|---|
| `bin/dev` | Start dev server at `http://localhost:3000` |
| `bin/build` | Production build → `.output/` |
| `bin/start` | Start production server (requires `bin/build` first) |
| `bin/setup` | First-time setup: copies `.env` files, installs deps, creates and migrates DBs |
| `bin/clean` | Remove build artifacts, cache, `node_modules`, test results |

## Code Quality

| Script | What it does |
|---|---|
| `bin/ts-check` | TypeScript check (whole project) |
| `bin/ts-watch` | TypeScript check in watch mode |
| `bin/lint` | oxlint — passes args through |
| `bin/lint-fix` | oxlint with `--fix` — passes args through |
| `bin/format` | oxfmt format — passes args through |
| `bin/format-check` | oxfmt check only (no writes) — passes args through |

## Testing

| Script | What it does |
|---|---|
| `bin/test` | All tests: unit + e2e |
| `bin/test-vitest [file]` | Unit tests; pass a file path to run a single file |
| `bin/test-vitest-watch [file]` | Unit tests in watch mode; accepts vitest args |
| `bin/test-e2e [args]` | E2E tests (runs setup first); passes args to Playwright |
| `bin/test-e2e-ui` | E2E tests with Playwright UI mode |
| `bin/test-e2e-setup` | Installs Playwright browsers and migrates test DB |

Examples:

```bash
bin/test-vitest src/server/__tests__/userHandlers.node.test.ts
bin/test-vitest-watch src/components/__tests__/
bin/test-e2e --headed
bin/test-e2e src/test/e2e/authentication.test.ts
```

## Database

| Script | What it does |
|---|---|
| `bin/db generate` | Generate migration from schema changes |
| `bin/db migrate` | Apply pending migrations |
| `bin/db push` | Push schema directly (dev only, no migration file) |
| `bin/db studio` | Open Drizzle Studio UI |

All `bin/db` commands forward args to `drizzle-kit` and load `.env` automatically.

## CI / Deployment

| Script | What it does |
|---|---|
| `bin/ci` | Full CI pipeline: type-check → install Playwright → all tests |
| `bin/build-prod` | Build + migrate (for production deploys) |
| `bin/deploy` | Validate config → migrate → build |
| `bin/validate-env` | Validate environment configuration |

## Internals (don't call directly)

| Script | Purpose |
|---|---|
| `bin/load-env` | Sourced by other scripts to load `.env` / `.env.test` once |
| `bin/dotenv` | Low-level dotenv utility used by `load-env` |

## Environment loading

Scripts automatically load the right env file:
- Most scripts: `.env`
- `test-*` scripts: `.env.test` (falls back to `.env` if missing)

Environment is loaded only once per shell session — subsequent calls skip re-loading.
