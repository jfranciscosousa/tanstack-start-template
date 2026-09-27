# AGENTS.md

Production-ready TanStack Start full-stack template with session-based auth, PostgreSQL, and React 19.

**Package manager:** pnpm

## CRITICAL:

- All project operations go through `pnpm <script>` or `scripts/` directly — never call underlying tools (vite, drizzle-kit, vitest, playwright) directly
- Run `pnpm lint`, `pnpm ts-check`, and `pnpm format` on all changes ALWAYS — do not skip warnings or errors

## Skills

- Keep every project skill in `.agents/skills/` as the canonical source.
- Expose each canonical skill to other agents through symlinks

## Browser self-test

- For authenticated `agent-browser` self-tests, use `pnpm browser:auth` to install a Better Auth session cookie before opening the app. It can create a test user or sign in with existing credentials. Follow `.agents/skills/better-auth-best-practices/SKILL.md` → "Browser self-test sessions". Test the login UI only when the login flow is the subject of the test.
- Generate test user data as needed. Create users through the internal services that users would eventually use. Edit the database directly only as a last resort.

## Code guidelines

- Variables should have clear simple names. Don't: `e`. Do: `event`
- All source files must use hyphen-case (kebab-case) naming except specific TanStack Router files
- Don't apply db changes directly — use `pnpm db generate`
- Run targeted checks after changing code. Linter, formatters, tests where applicable. Focused, avoid running unrelated tests and checks for unrelated files.
