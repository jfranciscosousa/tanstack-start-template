# [MEDIUM] Session tokens are returned to client-side code

**File:** [`src/server/handlers/session-handlers.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/server/handlers/session-handlers.ts#L20-L24) (lines 20, 22, 23, 24)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `secrets-exposure`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

fetchUserSessions returns currentSessionToken from session.session.token and returns the raw sessions array from auth.api.listSessions. The UI consumes session.token for each listed session, so active session bearer tokens are serialized into client-accessible server function responses. This weakens HttpOnly cookie protections: any client-side script compromise on the origin can read the current token and tokens for other active devices, enabling session hijacking or persistence until the sessions expire or are revoked.

## Recommendation

Do not return bearer session tokens to the browser. Return only non-secret session metadata plus a derived isCurrentSession boolean. For revocation, use an opaque non-authenticator session id if Better Auth supports it, or keep token lookup/revocation entirely server-side with an ownership check before calling the auth API.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-07-16)
