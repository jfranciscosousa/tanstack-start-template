# AGENTS.md

> When asked to regenerate the agents file, use https://www.aihero.dev/a-complete-guide-to-agents-md as a guideline.

Production-ready TanStack Start full-stack template with session-based auth, PostgreSQL, and React 19.

**Package manager:** pnpm

## Commands

```bash
bin/dev                          # Dev server at http://localhost:3000
bin/build                        # Production build
bin/start                        # Start production server
bin/setup                        # First-time setup (deps + DB + migrations)
bin/ts-check [path/to/file.ts]   # TypeScript check (file or full project)
bin/lint                         # oxlint
bin/format                       # oxfmt
bin/test                         # All tests (unit + e2e)
bin/test-vitest                  # Unit tests only
bin/test-vitest-watch            # Unit tests in watch mode
bin/test-e2e                     # Playwright e2e tests
```

## Domain Guides

Load these when working on the relevant area:

- [Architecture & Patterns](docs/agents/ARCHITECTURE.md) — layered server architecture, server functions, routing, session utilities, error handling
- [Database](docs/agents/DATABASE.md) — schema, Drizzle ORM patterns, migrations
- [UI](docs/agents/UI.md) — DaisyUI components, Tailwind utilities, Lucide icons
- [Testing](docs/agents/TESTING.md) — Vitest environments, Playwright e2e, test utilities
- [Bin Scripts](docs/agents/BIN.md) — all available bin/ scripts and their args

## Code guidelines

- Variables should have clear simple names. Don't: `e`. Do `event`
