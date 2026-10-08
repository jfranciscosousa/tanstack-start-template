# Browser self-test sessions

After project setup, start the app with `bun run dev` in one terminal. In a second terminal, run:

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix selftest)"
bun run browser:auth
agent-browser open http://localhost:3000/profile
agent-browser snapshot -i
```

Use the configured `BETTER_AUTH_URL` instead of `http://localhost:3000` if the app runs on another origin. By default, `bun run browser:auth` creates a new user through Better Auth's sign-up endpoint.

To use an existing account, set its email and enter its password without displaying it (type the password and press Enter after `read`):

```bash
export BROWSER_AUTH_EMAIL="you@example.com"
read -rs BROWSER_AUTH_PASSWORD
export BROWSER_AUTH_PASSWORD
bun run browser:auth
unset BROWSER_AUTH_EMAIL BROWSER_AUTH_PASSWORD
agent-browser open http://localhost:3000/profile
```

Both modes expire the app's session cookie in `AGENT_BROWSER_SESSION`, then install the issued cookie without printing it. A failed sign-in leaves that browser session unauthenticated. Use the login form when testing login itself.
