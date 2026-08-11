# [MEDIUM] GitHub Actions are referenced by mutable tags

**File:** [`.github/workflows/ci.yml`](https://github.com/jfranciscosousa/tanstack-start-template/blob/master/.github/workflows/ci.yml#L21-L84) (lines 21, 23, 26, 30, 43, 52, 84)
**Project:** tanstack-start-template
**Severity:** MEDIUM • **Confidence:** high • **Slug:** `github-workflow-security`

## Owners

**Suggested assignee:** `francisco.sousa@hey.com` _(via last-committer)_

## Finding

The workflow uses action references such as actions/checkout@v6, marocchino/tool-versions-action@v2, actions/setup-node@v6, pnpm/action-setup@v6, actions/cache@v5, and actions/upload-artifact@v7. These major-version tags are mutable. If an action publisher account or repository is compromised, or a tag is moved maliciously, CI will execute attacker-controlled code with the workflow's permissions and access to any available secrets or build artifacts.

## Recommendation

Pin third-party and first-party actions to immutable full commit SHAs. Use dependency review or a scheduled update process to refresh those SHAs intentionally.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-10)
- renovate[bot] <29139614+renovate[bot]@users.noreply.github.com> (2026-03-21)
