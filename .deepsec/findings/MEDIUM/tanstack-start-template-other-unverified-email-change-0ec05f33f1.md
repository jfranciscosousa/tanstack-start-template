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

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-07-16)
