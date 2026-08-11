# Agent setup

This is a local-only Deepsec scanning workspace. Each registered project has
its own setup prompt at `data/<id>/SETUP.md`. Open the relevant prompt when
asked to set up a project.

## Execution policy

- Run all Deepsec commands locally through `pnpm deepsec`. This command uses
  `scripts/deepsec-guard.sh` to reject Vercel AI Gateway credentials and routes.
- Use the Pi agent with the user's local subscription authentication from
  `~/.pi/agent/auth.json` for AI-backed stages.
- Never use Vercel AI Gateway credits, `AI_GATEWAY_API_KEY`,
  `VERCEL_OIDC_TOKEN`, a Gateway model route, or a Gateway base URL.
- Never run `deepsec` directly. Direct execution bypasses the repository guard.
- Never use `deepsec sandbox` or `deepsec sandbox-all`. All analysis must run on
  the local machine.
- Treat `process`, `revalidate`, setup model analysis, and other AI-backed
  stages as paid work. Obtain explicit user approval before each run.

## Common tasks

- **Set up or resume a project**: use the scaffold-only/manual instructions in
  `data/<id>/SETUP.md`. Do not let setup select or restore a Gateway route.
- **Add a new project**: run `pnpm deepsec init-project <root>`. It scaffolds
  `data/<id>/` and prints or writes the setup prompt for the new project.
- **Write a custom matcher** (only after a real true-positive shows you
  a pattern worth keeping): read
  `node_modules/deepsec/dist/docs/writing-matchers.md`.

## Reference

The deepsec skill is at `node_modules/deepsec/SKILL.md` (after
`pnpm install`). The full docs ship at
`node_modules/deepsec/dist/docs/`.
