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

## Revalidation

**Verdict:** true-positive

The complete workflow references actions/checkout@v6, marocchino/tool-versions-action@v2, actions/setup-node@v6, pnpm/action-setup@v6, actions/cache@v5, and actions/upload-artifact@v7, all of which are mutable tag references rather than immutable commit SHAs. Every referenced action executes code inside the CI job, so moving one of these tags after a publisher or repository compromise would change the code executed by future workflow runs. The workflow runs on every push and installs dependencies, accesses the checked-out repository, controls caches and artifacts, and receives the job's GITHUB_TOKEN even though no explicit application secrets are configured. No workflow-level permissions restriction is present, so the token's effective privileges depend on repository defaults; checkout also has not disabled credential persistence. An attacker controlling a referenced action could therefore steal available credentials or source data, tamper with test execution or artifacts, and potentially exercise whatever repository permissions the job token has. The compromise of an upstream publisher is a prerequisite, but immutable pinning is specifically intended to prevent that supply-chain event from silently changing CI behavior, so the finding is real at MEDIUM severity.

## Recent committers (`git log`)

- Francisco Sousa <francisco.sousa@hey.com> (2026-05-10)
- renovate[bot] <29139614+renovate[bot]@users.noreply.github.com> (2026-03-21)
