---
name: check-pipelines
description: Check the latest Vercel deployment and GitHub Actions CI run for the current branch. Use when asked for current branch deployment or pipeline status.
---

# Check Pipelines

```bash
branch_name=$(git branch --show-current)
pnpm dlx vercel ls
gh run list --branch "$branch_name" --limit 1 \
  --json databaseId,status,conclusion,workflowName,url
```

Inspect the newest Vercel deployment when build logs are needed:

```bash
pnpm dlx vercel inspect <deployment-url> --logs
```
