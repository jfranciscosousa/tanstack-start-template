# [BUG] deleteTodo reports success when no row was deleted

**File:** [`src/server/services/todo-service.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/src/server/services/todo-service.ts#L37-L42) (lines 37, 42)
**Project:** tanstack-start-template
**Severity:** BUG • **Confidence:** high • **Slug:** `other-logic-bug`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

deleteTodo() assigns the result of .returning() to todo, but Drizzle returns an array. An empty array is truthy, so the `if (!todo)` check never fires when the todo does not exist or belongs to another user. The ownership condition still prevents cross-user deletion, so this is not an authorization bypass, but callers receive `{ success: true }` for failed deletions.

## Recommendation

Destructure the returned row, e.g. `const [todo] = await db.delete(...).returning();`, then throw NOT_FOUND when no row is returned.

## Revalidation

**Verdict:** true-positive

The complete `deleteTodo` implementation stores the result of Drizzle's `.returning()` directly in `todo`, rather than destructuring a returned row. For PostgreSQL deletes, `.returning()` produces an array, including an empty array when the `WHERE` condition matches no rows. Since an empty array is truthy in JavaScript, `if (!todo)` cannot detect the no-row case and the function returns `{ success: true }`. The end-to-end path validates that the supplied ID is a UUID and obtains the authenticated user through `useLoggedInAppSession`, but neither layer verifies that a row was deleted. A logged-in caller can submit a nonexistent UUID, a stale ID, or another user's todo ID and receive a success result despite no deletion. The compound `id` and `userId` predicate correctly prevents deletion of another user's data, so this is not an authorization bypass. The service test for another user's todo currently calls `deleteTodo` without expecting an error, further confirming that the false-success behavior is present. No current-code mitigation converts the returned array into a row or checks its length, so the finding is real and BUG severity is appropriate.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-01)
