# AGENTS.md

> When asked to regenerate the agents file, use https://www.aihero.dev/a-complete-guide-to-agents-md as a guideline.

Production-ready TanStack Start full-stack template with session-based auth, PostgreSQL, and React 19.

**Package manager:** pnpm

## Domain Guides

Load these when working on the relevant area:

- [Architecture & Patterns](docs/agents/ARCHITECTURE.md) — layered server architecture, server functions, routing, session utilities, error handling
- [Database](docs/agents/DATABASE.md) — schema, Drizzle ORM patterns, migrations
- [UI](docs/agents/UI.md) — DaisyUI components, Tailwind utilities, Lucide icons
- [Testing](docs/agents/TESTING.md) — Vitest environments, Playwright e2e, test utilities
- [Bin Scripts](docs/agents/BIN.md) — all available bin/ scripts and their args

## Code guidelines

- Variables should have clear simple names. Don't: `e`. Do `event`
- All source files must use hyphen-case (kebab-case) naming except specific TanstackRouter files
- All project operations go through `bin/` scripts. Never call `pnpm vite`, `pnpm vitest`, `pnpm playwright`, or `pnpm drizzle-kit` directly. Check `docs/agents/BIN.md` for reference.
