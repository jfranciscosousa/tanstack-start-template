# [MEDIUM] Account email addresses can be changed without ownership verification

**File:** [`src/lib/auth.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/lib/auth.ts#L31-L33) (lines 31, 32, 33)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `other-unverified-email-change`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The Better Auth configuration enables email changes and sets `updateEmailWithoutVerification: true`. Consequently, an authenticated user can immediately assign an email address they do not control to their account. This permits users to claim unverified identities and makes a stolen session more persistent because an attacker can replace the victim's email without access to the new mailbox. Other application features may also incorrectly treat the resulting email as verified ownership.

## Recommendation

Disable `updateEmailWithoutVerification` and configure Better Auth's email-change verification flow. Keep the existing address active until the user proves control of the new address, and consider requiring recent password reauthentication for this sensitive operation.

## Revalidation

**Verdict:** true-positive

The Better Auth configuration explicitly enables email changes and sets `updateEmailWithoutVerification: true`, while no email-verification sender is configured. Better Auth's installed implementation confirms that this option immediately updates the email only when the current user is not verified; this application's normal email/password registrations are unverified because no verification flow is configured. `updateUserFn` exposes the operation to authenticated users and calls `auth.api.changeEmail` whenever the submitted address differs from the session address. Server-side validation checks only that the new value is a syntactically valid email and does not prove mailbox ownership. Although the HTML form marks the current-password field as required, the schema accepts an empty value and the handler does not require password verification for an email-only change, so a direct server-function request with an authenticated session can bypass that UI control. An attacker with a stolen session can therefore replace the victim's login identifier with an arbitrary unused address and prevent the victim from signing in with the old address, while an ordinary user can associate an identity they do not control with their account. Better Auth's sensitive-session middleware does not establish ownership of the new mailbox, so it does not mitigate the reported issue.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-08-11)
