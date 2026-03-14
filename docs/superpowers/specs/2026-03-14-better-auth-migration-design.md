# Better-Auth Migration Design

**Date:** 2026-03-14
**Status:** Approved

## Overview

Replace the hand-rolled auth system (custom users/sessions tables, bcrypt-ts, TanStack Start `useSession`) with [better-auth](https://www.better-auth.com/). The migration targets email/password auth with email verification via Resend + React Email, and is structured to make adding OAuth providers (GitHub, Google, etc.) trivial in future.

## Goals

- Email/password auth managed by better-auth
- Email verification on signup (Resend + React Email)
- Session management handled by better-auth (list, revoke)
- Custom `theme` user field preserved via `additionalFields`
- Easy path to adding OAuth providers later
- Types and tests pass throughout

## Non-Goals

- OAuth providers (deferred)
- Password reset flow (deferred — better-auth supports it, just not in scope now)
- Changing any UI beyond what the auth wiring requires

---

## New Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | better-auth server instance — Drizzle adapter, emailAndPassword plugin, email verification, Resend sender, `theme` additionalField |
| `src/lib/auth-client.ts` | better-auth client (`createAuthClient`) for use in React components |
| `src/routes/api/auth/$.tsx` | TanStack Start API route — proxies all `/api/auth/**` to better-auth's handler |
| `src/emails/verify-email.tsx` | React Email template for verification emails |
| `src/routes/_unauthed/verify-email.tsx` | "Check your inbox" page shown after signup |

---

## Deleted Files

| File | Reason |
|------|--------|
| `src/server/web-session.ts` | Replaced by `auth.api.getSession()` |
| `src/server/services/password-service.ts` | better-auth handles hashing internally |
| `src/server/services/session-service.ts` | better-auth handles session CRUD |

---

## Modified Files

### `src/server/db/schema.ts`

Remove `users` and `sessions` table definitions (better-auth owns these). Add better-auth tables as Drizzle schema objects:

- `user` — id, name, email, emailVerified, image, createdAt, updatedAt, **theme** (additionalField)
- `session` — id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt
- `account` — for OAuth (future), required by better-auth even for email/password
- `verification` — for email verification tokens

Keep `todos` table; update its `userId` FK to reference `user.id`.

Export updated type aliases (`User`, `Session`, etc.) from better-auth's inferred types.

### `src/server/handlers/session-handlers.ts`

| Old | New |
|-----|-----|
| `loginFn` → manual DB lookup + bcrypt | `loginFn` → `auth.api.signInEmail({ body, asResponse: true })` |
| `createAndUseSession` | Deleted — better-auth sets the cookie itself |
| `invalidateCurrentSession` | `logoutFn` → `auth.api.signOut({ headers })` |
| `fetchUserSessions` | `fetchUserSessions` → `auth.api.listSessions({ headers })` |
| `revokeSession` | `revokeSession` → `auth.api.revokeSession({ body: { token } })` |

### `src/server/handlers/user-handlers.ts`

| Old | New |
|-----|-----|
| `signupFn` → `createUser` → `createAndUseSession` | `signupFn` → `auth.api.signUpEmail({ body })` → redirect to `/verify-email` |
| `updateUserFn` → manual password verify + update | `updateUserFn` → `auth.api.changePassword` + `auth.api.updateUser` |
| `updateThemeFn` | Unchanged (direct Drizzle update on `user.theme`) |

### `src/server/services/user-services.ts`

Strip down to:
- `updateUserTheme` — direct Drizzle update (better-auth's `updateUser` doesn't cover custom fields easily)

Remove: `getUserBySessionId`, `getUserByEmail`, `createUser`, `updateUser` — all superseded by better-auth.

### `src/routes/__root.tsx`

Replace `fetchCurrentUser` (which calls `useWebSession`) with a server function that calls:
```ts
auth.api.getSession({ headers: getWebRequest().headers })
```
Return `session.user` (typed from better-auth).

### `src/routes/logout.tsx`

Call `auth.api.signOut` instead of `invalidateCurrentSession`.

### `src/domains/signup/signup-page.tsx`

After successful signup, redirect to `/verify-email` instead of `/`. The verify-email page shows "Check your inbox" messaging.

### `src/domains/profile/sessions-tab.tsx`

Update to use better-auth session shape. better-auth sessions have a `token` field (not `id`) as the revocation identifier.

---

## Database Migration

1. Run `npx @better-auth/cli generate` to generate better-auth's Drizzle schema
2. Write a Drizzle migration that:
   - Renames `users` → `user`, preserving existing data
   - Adds `emailVerified` (boolean), `image` (text nullable) columns to `user`
   - Renames `sessions` → `session`, adjusting columns to better-auth's shape
   - Creates `account` and `verification` tables
   - Updates `todos.user_id` FK to reference `user.id`

---

## Auth Flows

### Signup
```
signup form → signupFn → auth.api.signUpEmail
  → better-auth creates user (emailVerified: false)
  → better-auth sends verification email (Resend + React Email template)
  → redirect to /verify-email ("check your inbox")
```

### Email Verification
```
user clicks link in email → /api/auth/verify-email?token=...
  → better-auth verifies token, sets emailVerified: true
  → redirects to /
```

### Login
```
login form → loginFn → auth.api.signInEmail
  → better-auth verifies password, creates session, sets cookie
  → redirect to /
```

Note: better-auth can be configured to block login for unverified emails (`requireEmailVerification: true`).

### Logout
```
navbar logout → logoutFn → auth.api.signOut
  → better-auth clears session cookie
  → redirect to /login
```

### Session Guard
```
__root.tsx beforeLoad → auth.api.getSession({ headers })
  → returns { user, session } or null
  → _authed.tsx checks context.user, redirects to /login if absent
```

---

## Environment Variables

Add to `.env`:
```
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=<resend api key>
```

Remove: `SECRET_KEY_BASE` (replaced by `BETTER_AUTH_SECRET`)

---

## Testing Strategy

### Unit Tests (Vitest)

- **Delete:** `password-service.server.test.ts`, `session-service.server.test.ts`, `web-session.server.test.ts`
- **Rewrite:** `session-handlers.server.test.ts` — mock `auth.api` methods
- **Rewrite:** `user-handlers.server.test.ts` — mock `auth.api` methods
- **Simplify:** `user-services.server.test.ts` — only test `updateUserTheme`

### E2E Tests (Playwright)

- `authentication.test.ts` — add step for email verification (use better-auth test helper or set `BETTER_AUTH_DISABLE_EMAIL_VERIFICATION=true` in test env)
- `profile.test.ts` — update session revocation assertions (token-based IDs)

### Types

Run `tsc --noEmit` after each step. Key type changes:
- `User` type from `typeof users.$inferSelect` → from better-auth's `auth.$Infer.Session.user`
- `Session` type similarly from better-auth
- Remove `UserWithoutPassword` (better-auth never exposes password)

---

## Future: Adding OAuth

Adding GitHub login later requires only:
1. Add `socialProviders` to `auth.ts`: `github: { clientId, clientSecret }`
2. Add a "Login with GitHub" button that calls `authClient.signIn.social({ provider: 'github' })`
3. No schema changes needed — the `account` table already handles this

---

## Packages to Install

```
better-auth
@react-email/components
react-email
resend
```

```
# Remove
bcrypt-ts  (and @types/bcrypt if present)
```
