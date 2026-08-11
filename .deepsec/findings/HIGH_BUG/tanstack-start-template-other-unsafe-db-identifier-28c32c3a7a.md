# [HIGH_BUG] Worktree database create/drop uses raw SQL with unvalidated identifiers

**File:** [`scripts/worktree.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/scripts/worktree.ts#L230-L432) (lines 230, 292, 306, 309, 412, 432)
**Project:** tanstack-start-template
**Severity:** HIGH_BUG • **Confidence:** high • **Slug:** `other-unsafe-db-identifier`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The scanner-reported LIKE query is parameterized and not SQL injection, but the CREATE/DROP paths interpolate database identifiers into sql.unsafe with only double quotes around them. cmdSetup derives newDb from the git worktree basename without the create command's /^[a-z0-9][a-z0-9-]*$/ validation, and cmdDelete can derive dbName from either an arbitrary CLI name or the target worktree's .env DATABASE_URL. If those values contain a quote or point outside the expected worktree database naming scheme, the script can execute malformed raw SQL or drop a database that is not a safe worktree clone. This is a local destructive tooling bug rather than a remotely exploitable application vulnerability.

## Recommendation

Centralize database identifier validation/escaping before cloneDatabase and dropDatabase. Require sourceDb, newDb, and dbName to match a strict identifier allowlist, apply the same worktree-name validation in setup/delete, and refuse to drop any database that does not equal the expected repo-derived worktree database name or allowed prefix.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-07-31)
