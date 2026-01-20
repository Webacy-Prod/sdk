---
description: Sync main back to staging after a release
---

You are helping sync main back to staging after a release has been merged and published.

## Step 1: Verify Release Merged

Check that the release PR was merged to main:

```bash
git fetch origin
git log origin/main --oneline -5
```

Look for a recent "chore: release v{VERSION}" commit on main.

If no release commit found:
```text
No recent release found on main. Make sure the release PR was merged before running /sync.
```

## Step 2: Check Current Branch

Check current branch and status:

```bash
git branch --show-current
git status
```

If there are uncommitted changes:
```text
You have uncommitted changes. Please commit or stash them first.
```

## Step 3: Sync Main to Staging

Merge main into staging:

```bash
git checkout staging
git pull origin staging
git merge origin/main --no-edit
git push origin staging
```

If there are merge conflicts:
```text
Merge conflicts detected. Please resolve them manually:
1. Fix the conflicts in the affected files
2. git add .
3. git commit
4. git push origin staging
```

## Step 4: Confirm

Output success message:

```text
Sync complete!

Main has been merged into staging.
Both branches are now in sync with the release.

You can now start new feature development from staging.
```

## When to Use

Run `/sync` after:
1. A release PR has been merged to main
2. GitHub Actions has completed publishing to npm
3. You want to continue development with the latest version

## Flow Diagram

```text
main (with release commit)
    │
    ▼
staging (merge from main)
    │
    ▼
ready for new development
```

## Error Handling

- If no release on main: Wait for release PR to be merged
- If merge conflicts: Resolve manually and push
- If push fails: Check permissions and try again
