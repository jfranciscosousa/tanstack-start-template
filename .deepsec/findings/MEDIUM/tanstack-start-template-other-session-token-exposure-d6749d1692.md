# [MEDIUM] Raw session tokens are passed into client-rendered profile data

**File:** [`src/domains/profile/profile-page.tsx`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/domains/profile/profile-page.tsx#L9-L42) (lines 9, 39, 40, 41, 42)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `other-session-token-exposure`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

ProfilePage reads `sessions` and `currentSessionToken` from the authenticated route loader and passes them directly into SessionsTab. The loader in `src/server/handlers/session-handlers.ts` returns `currentSessionToken: session.session.token` and the full `sessions` objects from `auth.api.listSessions()`, whose schema includes the unique session bearer `token`. In a TanStack Start SSR/client route, this loader data must be serialized to the browser for hydration, exposing active session tokens to client-side JavaScript and page data inspection. These tokens should be treated as credentials; exposing all active session tokens increases the impact of any client-side script compromise or data leak because non-current sessions can be stolen or revoked by token.

## Recommendation

Do not return raw session tokens to the client. Have the server return a safe session view with non-sensitive fields and an `isCurrent` boolean. For revocation, accept a session id or opaque non-auth credential identifier and enforce on the server that it belongs to the authenticated user and is not the current session.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-03-14)
