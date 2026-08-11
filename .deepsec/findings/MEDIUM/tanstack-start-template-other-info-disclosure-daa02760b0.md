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

## Revalidation

**Verdict:** true-positive

`renderError()` still returns the `message` property from every object without checking whether it is an approved public error type. The helper is directly used by the shared client-side `Form` component and by the active-session revocation UI, and TanStack server-function errors preserve their message across serialization, as the project's `ParamsError` implementation explicitly documents. Expected password failures are converted to controlled `ParamsError` messages, but errors from `auth.api.changeEmail`, `auth.api.updateUser`, session listing, and session revocation are not generally caught or sanitized by the application handlers. A concrete trigger exists around concurrent email changes: Better Auth performs an email-existence check before updating the uniquely indexed `users.email`, so racing two accounts toward the same previously unused address can make one update raise a database uniqueness error after both checks pass. If that dependency error propagates through the server function, the form renders its raw PostgreSQL/adapter message, potentially revealing table or constraint names and database implementation details. React escapes the text and therefore prevents XSS, but it does not mitigate information disclosure. The impact is limited to diagnostic information rather than credentials or authorization bypass, so the reported medium severity is reasonable.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-04-26)
