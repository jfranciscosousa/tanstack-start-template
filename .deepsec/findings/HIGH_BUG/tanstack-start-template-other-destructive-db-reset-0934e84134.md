# [HIGH_BUG] Database reset can drop a production database if misconfigured

**File:** [`scripts/db.reset.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/scripts/db.reset.ts#L5-L20) (lines 5, 7, 17, 18, 19, 20)
**Project:** tanstack-start-template
**Severity:** HIGH_BUG • **Confidence:** high • **Slug:** `other-destructive-db-reset`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The script accepts any DATABASE_URL from the environment, connects to it, and drops the public and drizzle schemas with CASCADE before recreating public. There is no safety guard requiring NODE_ENV=test/development, no database-name allowlist, and no explicit confirmation flag. Because loadEnv skips local .env loading in production but still allows an externally supplied DATABASE_URL, an accidental invocation in a production shell or CI environment could destroy production data.

## Recommendation

Add a hard safety check before connecting: require NODE_ENV to be test/development, reject production-looking hosts/database names, and require an explicit destructive flag such as --force-reset. Prefer limiting this script to test databases by name or URL pattern.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-10)
