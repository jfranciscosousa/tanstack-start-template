# [BUG] Password confirmation is not enforced by the server-side schema

**File:** [`src/schemas/user-schemas.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/schemas/user-schemas.ts#L37) (lines 37)
**Project:** tanstack-start-template
**Severity:** BUG • **Confidence:** high • **Slug:** `other-validation-bypass`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

updateUserSchema defines passwordConfirmation but only validates its length/emptiness; it never checks that it matches password. This schema is used as the server function validator in src/server/handlers/user-handlers.ts before auth.api.changePassword is called, and the handler ignores passwordConfirmation. The profile UI adds a field-level client validation, but a direct server-function call can submit password='new-password' and passwordConfirmation='different-value' and still change the password. This is not an attacker privilege escalation because the current password is still required, but it is a real server-side contract bug that can cause accidental account lockout if a client bypasses or regresses the UI validation.

## Recommendation

Add a schema-level cross-field refinement to updateUserSchema requiring passwordConfirmation to equal password whenever password is non-empty. Consider doing the same for signUpSchema so password confirmation is enforced by the shared schema rather than only by UI field validation.

## Revalidation

**Verdict:** true-positive

The complete `updateUserSchema` validates `password` and `passwordConfirmation` independently but has no object-level refinement requiring equality. Because both fields have defaults, the schema can also accept a non-empty password with an omitted or empty confirmation. `updateUserFn` uses this schema as its server-function validator, but its password-changing branch passes only `currentPassword` and `password` to `auth.api.changePassword`; `passwordConfirmation` is never consulted. An authenticated user can therefore invoke the server function directly with a valid current password, a valid new password, and a different valid-length confirmation, and the password will be changed to the value in `password`. Better Auth still verifies the current password, session authentication is required, and the global server-function CSRF middleware blocks cross-origin request forgery, so this is not an account-takeover or privilege-escalation issue. The equality check in `src/domains/profile/profile-tab.tsx` is field-level client validation and does not protect direct callers or alternative clients. The current repository version still contains the vulnerable schema and handler behavior, with no server-side equality check or downstream confirmation enforcement. Thus the reported validation-contract bypass and resulting risk of an unintended password change or lockout are real, with BUG severity appropriate.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-03-17)
