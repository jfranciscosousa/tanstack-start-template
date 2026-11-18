# Runtime and dependency maintenance

## Runtimes and build

- Bun is the runtime and package manager. `.tool-versions`, GitHub Actions, and `vercel.json` track Bun canary. On 2026-11-18, `mise` returned HTTP 404 for canary. Use the [Bun canary release](https://github.com/oven-sh/bun/releases/tag/canary) binary until `mise` resolves the correct asset.
- Match the CI PostgreSQL image tag to the version in `.tool-versions`. The local Vercel build selects `nodejs26.x`. Check the build output when changing the Node major version. The local build does not verify hosted settings or behavior.

## Version holds

Last checked 2026-11-18:

- Keep `drizzle-orm` and `drizzle-kit` at `1.0.0-rc.2-203eab8`. The matched `1.0.0-rc.5` pair rejects the existing migration snapshots. Revisit when the snapshot upgrade can be validated against existing databases.
- Nitro tracks the 3.0 release candidate. Move to stable when Nitro 3.0 is available.
- `lucide-react` 1.75.0 and Vitest 5.1.1 had not passed Bun's 24-hour release-age rule. Recheck after that period.

## Dependency audits

On 2026-11-18, the app audit went from 22 advisories to 2, and the Deepsec audit went from 7 to 2. GitHub reported Dependabot alerts disabled (HTTP 403); both local audits ran. The remaining findings are transitive.

| Scope       | Finding                                                                                         | When to recheck                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| App tooling | [`minimatch` 10.2.6](https://github.com/advisories/GHSA-g3hv-75wg-m249)                         | The Shadcn CLI dependency chain accepts Minimatch 11.                                |
| App tooling | [`picomatch` 4.0.7](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)                          | Picomatch publishes a fix.                                                           |
| Deepsec     | [`minimatch` 10.2.6](https://github.com/advisories/GHSA-g3hv-75wg-m249)                         | Deepsec accepts Minimatch 11.                                                        |
| Deepsec     | [`zod` 3.24.4](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) through `@vercel/sandbox` 1.x | Deepsec adopts a Sandbox release that uses Zod 4. There is no patched Zod 3 release. |

The app tooling packages were not found in the local Vercel server bundle. `.deepsec` is a separate, local-only pnpm workspace. Audit and update it separately. Keep its Zod 4 override until the dependency graph resolves patched Zod 4 without it.

## Isolated checks

- For E2E tests, set `E2E_PORT` and point `BETTER_AUTH_URL` to `http://localhost:<E2E_PORT>`. The setup resets the database named in `DATABASE_URL`. Use a throwaway local database and drop it after the tests.
- Playwright allows 120 seconds for the first Nitro render on a cold start. The 30-second limit timed out twice on the 2026-11-18 baseline; all 13 Chromium tests passed with the longer limit and an isolated port.
- E2E tests use native Playwright queries. `@playwright-testing-library/test` is archived and breaks with Playwright 1.64 and later. Do not add it back.
- On 2026-11-18, both frozen installs, lint, formatting, type checks, the local Vercel-target build, 69 Vitest tests, and the script and skill checks passed. Hosted CI, live deployment, and paid Deepsec scans did not run.
