# AGENTS.md

> When asked to regenerate the agents file, use https://www.aihero.dev/a-complete-guide-to-agents-md as a guideline.

Production-ready TanStack Start full-stack template with session-based auth, PostgreSQL, and React 19.

**Package manager:** pnpm

## CRITICAL:

- All project operations go through `pnpm <script>` or `scripts/` directly — never call underlying tools (vite, drizzle-kit, vitest, playwright) directly
- Run `pnpm lint`, `pnpm ts-check`, and `pnpm format` on all changes ALWAYS — do not skip warnings or errors

## Domain Guides

Load these when working on the relevant area:

- [Architecture & Patterns](docs/agents/ARCHITECTURE.md) — layered server architecture, server functions, routing, session utilities, error handling
- [UI](docs/agents/UI.md) — DaisyUI components, Tailwind utilities, Lucide icons
- [Testing](docs/agents/TESTING.md) — Vitest environments, Playwright e2e, test utilities, testing guidelines
- [Scripts](docs/agents/SCRIPTS.md) — all available scripts and their args

## Code guidelines

- Variables should have clear simple names. Don't: `e`. Do: `event`
- All source files must use hyphen-case (kebab-case) naming except specific TanStack Router files
- Don't generate database migrations directly — use `pnpm db generate`
