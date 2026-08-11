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

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-03-17)
