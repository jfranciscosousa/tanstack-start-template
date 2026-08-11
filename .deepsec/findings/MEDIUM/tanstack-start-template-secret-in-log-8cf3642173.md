# [MEDIUM] Database credentials are printed to logs

**File:** [`scripts/db.reset.ts`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/scripts/db.reset.ts#L7-L14) (lines 7, 13, 14)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `secret-in-log`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The reset script reads DATABASE_URL and logs the full value before connecting. PostgreSQL connection URLs commonly include username, password, host, database name, and sometimes provider tokens. If this script runs in CI or shared developer logs, those credentials can be exposed to anyone with log access. Evidence: line 7 reads process.env.DATABASE_URL, and lines 13-14 interpolate the full databaseUrl into console output.

## Recommendation

Do not log the full connection URL. Log only a redacted/sanitized form such as protocol, host, and database name, with username/password/query parameters removed.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-10)
