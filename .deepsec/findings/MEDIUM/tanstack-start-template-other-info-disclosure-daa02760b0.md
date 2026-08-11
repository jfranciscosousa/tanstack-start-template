# [MEDIUM] Raw exception messages are rendered to users

**File:** [`src/errors/index.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/errors/index.ts#L53-L59) (lines 53, 58, 59)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `other-info-disclosure`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

`renderError` returns the `message` property of any object without determining whether the exception is safe for client disclosure. This helper is used by client-facing forms and session-management UI. Unhandled errors from database operations, Better Auth, or other server dependencies can therefore expose implementation details, constraint names, internal identifiers, or operational data to an attacker who deliberately causes an error. React escapes the returned text, so this is not XSS, but escaping does not prevent information disclosure.

## Recommendation

Only expose messages from explicitly recognized public error types such as `AppError` with an allowlisted code. Return a generic internal-server-error message for all unexpected exceptions, while recording detailed exception data exclusively in server-side logs.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-04-26)
