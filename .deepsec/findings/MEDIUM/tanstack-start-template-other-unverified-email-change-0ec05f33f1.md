# [MEDIUM] Email changes are accepted without verification

**File:** [`src/server/handlers/user-handlers.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/server/handlers/user-handlers.ts#L41-L45) (lines 41, 42, 43, 44, 45)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** medium • **Slug:** `other-unverified-email-change`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

updateUserFn allows an authenticated user to change their account email by calling auth.api.changeEmail whenever data.email differs from the current session email. The related auth configuration enables changeEmail with updateEmailWithoutVerification: true, so the new address becomes active without proving mailbox ownership. In systems that use email as an identity or authorization signal, a user can claim an address they do not control and impersonate that identity in downstream workflows.

## Recommendation

Require email verification before activating a changed email address. Disable updateEmailWithoutVerification, send a verification challenge to the new address, and keep the previous verified email active until the challenge succeeds.

## Revalidation

**Verdict:** true-positive

The authenticated `updateUserFn` calls `auth.api.changeEmail` whenever a syntactically valid submitted email differs from the current session email. In `src/lib/auth.ts`, Better Auth explicitly enables `updateEmailWithoutVerification: true`, and no email-delivery or new-address verification callback is configured. The Zod schema verifies only the address format and length, not control of the destination mailbox. Although the rendered form marks `currentPassword` as required, the server schema accepts an empty string and the handler performs its password check only when that string is truthy, so a direct server-function caller can change email without reauthentication. An authenticated malicious user can consequently claim an unused address belonging to another person, while an attacker holding a stolen session can replace the victim's account email without proving control of either mailbox. Authentication, CSRF middleware, and same-origin protections establish authorization to invoke the function but do not verify ownership of the new address. The configuration comment itself acknowledges that retaining this behavior once email delivery is used would be unsafe, and the project describes itself as a production-ready authentication template.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-07-16)
