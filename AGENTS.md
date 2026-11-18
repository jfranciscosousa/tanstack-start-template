# AGENTS.md

Production-ready TanStack Start full-stack template with session-based auth, PostgreSQL, and React 19.

**Runtime and package manager:** Bun canary

Use `bunx` for one-shot tools.

## CRITICAL:

- All project operations go through `bun run <script>` or `scripts/` directly — never call underlying tools (vite, drizzle-kit, vitest, playwright) directly
- Run `bun run lint`, `bun run ts-check`, and `bun run format` on all changes ALWAYS — do not skip warnings or errors

## Skills

- Keep project guidance in `AGENTS.md` and every project skill in `.agents/skills/`.
- Write guidance that works across agent harnesses. Use shared paths instead of harness-specific copies or symlinks.
- Keep project-specific guidance outside imported skills so `bun run skills:update` preserves it.
- If `bun run skills:update` reports a failure, check the upstream skill names for a rename or removal. Migrate the directory and lock entry when a skill is renamed, then retry.

## Browser self-test

- For authenticated `agent-browser` self-tests, use `bun run browser:auth` to install a Better Auth session cookie before opening the app. It can create a test user or sign in with existing credentials. Follow `.agents/browser-self-test.md`. Test the login UI only when the login flow is the subject of the test.
- Generate test user data as needed. Create users through the internal services that users would eventually use. Edit the database directly only as a last resort.

## Code guidelines

- Variables should have clear simple names. Don't: `e`. Do: `event`
- All source files must use hyphen-case (kebab-case) naming except specific TanStack Router files
- Don't apply db changes directly — use `bun run db generate`
- Run targeted checks after changing code. Linter, formatters, tests where applicable. Focused, avoid running unrelated tests and checks for unrelated files.

## Runtime and dependency maintenance

- Bun tracks canary in `.tool-versions`, CI, and `vercel.json`. `mise` still returns HTTP 404 for canary. Use the [Bun canary release](https://github.com/oven-sh/bun/releases/tag/canary) binary until `mise` resolves the correct asset (checked 2026-11-18).
- Match the CI PostgreSQL image tag to `.tool-versions`. The local Vercel build selects `nodejs26.x`; check the built runtime when changing the Node major version.
- Keep `drizzle-orm` and `drizzle-kit` at `1.0.0-rc.2-203eab8`. The matched `1.0.0-rc.5` pair rejects the existing migration snapshots. Revisit when the snapshot upgrade can be validated against existing databases (checked 2026-11-18).
- Nitro tracks the 3.0 release candidate. Move to stable when Nitro 3.0 is available (checked 2026-11-18).
- `lucide-react` 1.75.0 and Vitest 5.1.1 have not passed the 24-hour Bun release age on 2026-11-18. Recheck after that period.
- The app audit still reports transitive [`minimatch` 10.2.6](https://github.com/advisories/GHSA-g3hv-75wg-m249) and [`picomatch` 4.0.7](https://github.com/advisories/GHSA-fc5q-39xc-vjpf). These are tooling paths, not part of the Vercel server bundle. Recheck when the Shadcn CLI dependency chain accepts Minimatch 11 or Picomatch publishes a fix (checked 2026-11-18).
- `.deepsec` is a separate, local-only pnpm workspace. Audit and update it on its own. Keep the Zod 4 override for [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) until the dependency graph resolves patched Zod 4 on its own. Zod 3.24.4 remains through `@vercel/sandbox` 1.x; there is no patched Zod 3 release. Deepsec also remains on vulnerable [`minimatch` 10.2.6](https://github.com/advisories/GHSA-g3hv-75wg-m249). Recheck when Deepsec adopts a Sandbox release that uses Zod 4 and accepts Minimatch 11 (checked 2026-11-18).
- For isolated E2E runs, set `E2E_PORT` and point `BETTER_AUTH_URL` to `http://localhost:<E2E_PORT>`. The E2E setup resets the database named in `DATABASE_URL`; use a throwaway local database. Playwright allows 120 seconds for the first Nitro render on a cold start.
- E2E tests use native Playwright queries. `@playwright-testing-library/test` is archived and breaks Playwright 1.64 and later. Do not add it back.
