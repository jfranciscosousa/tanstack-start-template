# [MEDIUM] Session bearer tokens are returned to browser route data

**File:** [`src/routes/_authed/profile.tsx`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/routes/_authed/profile.tsx#L10) (lines 10)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** medium • **Slug:** `secrets-exposure`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The profile route loader calls fetchUserSessions(), which returns currentSessionToken and the full sessions array from Better Auth. The traced handler at src/server/handlers/session-handlers.ts includes session.session.token and each session token in the loader response. These values are session bearer credentials and will be available to client-side JavaScript/serialized route data, weakening the protection normally provided by HttpOnly session cookies and allowing any same-origin script compromise or client-side data leak to capture active session tokens.

## Recommendation

Do not return raw session tokens to the client. Return non-secret session IDs or derived display data, mark the current session server-side, and make revocation accept a non-secret session identifier that the server authorizes against the authenticated user before revoking.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-20)
