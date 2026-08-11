# [MEDIUM] Session management UI stores and submits bearer session tokens client-side

**File:** [`src/domains/profile/sessions-tab.tsx`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/domains/profile/sessions-tab.tsx#L25-L203) (lines 25, 34, 89, 174, 203)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `other-session-token-exposure`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

SessionsTab declares every session prop with a `token` field, compares each token against `currentSessionToken`, and sends the selected token back to the revoke server function. Because these props are hydrated in the browser, raw active session credentials are available to client-side JavaScript even though the UI never visibly prints them. The token is also used as the revocation handle, forcing credential material to cross the client/server boundary unnecessarily.

## Recommendation

Replace token-bearing props with a sanitized DTO such as `{ id, userAgent, ipAddress, createdAt, updatedAt, expiresAt, isCurrent }`. Change revocation to submit a non-secret session id and perform ownership/current-session checks server-side before revoking.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-03-21)
