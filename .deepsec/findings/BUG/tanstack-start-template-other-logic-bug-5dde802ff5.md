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

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-01)
