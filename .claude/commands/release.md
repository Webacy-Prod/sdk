---
description: Create a release branch, bump version, and create PR to main
---

You are helping create a release for the Webacy SDK. This command implements the release workflow: staging → release branch → version bump → PR to main → GitHub Actions publish.

## Step 1: Verify on Staging

Check that you're on staging branch and it's clean:

```bash
git branch --show-current
git fetch origin
git status
```

If not on staging:
```text
You must be on staging branch to start a release.
Please run: git checkout staging && git pull origin staging
```

If there are uncommitted changes:
```text
You have uncommitted changes. Please commit or stash them first.
```

## Step 2: Ask for Version Type

Ask the user which version bump to perform (use AskUserQuestion tool):

- **Question**: "What type of version bump for this release?"
- **Options**:
  - **patch**: Bug fixes only (1.0.0 -> 1.0.1)
  - **minor**: New features, backward-compatible (1.0.0 -> 1.1.0)
  - **major**: Breaking changes (1.0.0 -> 2.0.0)

## Step 3: Calculate New Version

Fetch the current published version from npm (this is the source of truth):

```bash
CURRENT_VERSION=$(npm view @webacy/sdk version 2>/dev/null || echo "0.0.0")
```

Calculate the new version based on the bump type and show the user:
```text
Current npm version: 1.0.0
New version will be: 1.1.0
```

Note: If the package hasn't been published yet, it will default to 0.0.0.

## Step 4: Auto-Extract Changes

Get commits between main and staging for the PR description:

```bash
git log origin/main..origin/staging --pretty=format:"- %s" --no-merges
```

Store these for the PR body.

## Step 5: Create Release Branch

Create a release branch from staging:

```bash
git checkout -b release/{VERSION}
```

For example: `release/1.1.0`

## Step 6: Bump Version in All Packages

Update version in all package.json files:

```bash
# Update root package.json
npm version {TYPE} --no-git-tag-version

# Update each package
cd packages/core && npm version {TYPE} --no-git-tag-version && cd ../..
cd packages/threat && npm version {TYPE} --no-git-tag-version && cd ../..
cd packages/trading && npm version {TYPE} --no-git-tag-version && cd ../..
cd packages/sdk && npm version {TYPE} --no-git-tag-version && cd ../..
```

Also update the inter-package dependencies to the new version.

## Step 7: Commit Version Bump

Commit the version changes:

```bash
git add .
git commit -m "chore: release v{VERSION}"
```

## Step 8: Push Release Branch

Push the release branch to origin:

```bash
git push -u origin release/{VERSION}
```

## Step 9: Create PR to Main

Create a pull request targeting main:

```bash
gh pr create --base main --title "chore: release v{VERSION}" --body "$(cat <<'EOF'
## Release v{VERSION}

### Changes
{COMMITS_FROM_STEP_4}

### Checklist
- [ ] Version bumped in all packages
- [ ] Inter-package dependencies updated
- [ ] CI passes

### Post-merge
After merging this PR:
1. GitHub Actions will publish packages to npm
2. GitHub Actions will create git tag and GitHub release
3. Run `/sync` to merge main back to staging
EOF
)"
```

## Step 10: Confirm

Output the PR URL and next steps:

```text
Release PR created!

PR: {PR_URL}

Next steps:
1. Review the PR
2. Merge to main (squash or merge commit)
3. GitHub Actions will publish to npm and create the tag/release
4. Run /sync to merge main back to staging
```

## Important Notes

- Start from staging branch, not main
- Version is fetched from npm (source of truth), not package.json
- Release branch allows PR review before publishing
- Merging to main triggers GitHub Actions
- GitHub Actions publishes to npm and creates the git tag + GitHub release
- After merge, run `/sync` to bring changes back to staging
- Version must be bumped in ALL packages
- Inter-package dependencies must also be updated

## Release Flow Diagram

```text
staging (tested code)
    │
    ▼
release/{VERSION} branch (created from staging)
    │
    ▼
version bump (on release branch)
    │
    ▼
PR: release/{VERSION} → main
    │
    ▼
merge PR (version bump is in the PR)
    │
    ▼
GitHub Actions: npm publish + create tag/release
    │
    ▼
staging (sync from main via /sync)
```

## Error Handling

- If not on staging: Instruct to checkout staging
- If release branch exists: Delete or use different version
- If PR creation fails: Check gh CLI authentication
- If GitHub Actions fails: Check workflow logs, may need to re-run

## Pre-release Checklist

Before running `/release`:
- [ ] All features/fixes are merged to staging
- [ ] All tests pass locally on staging
- [ ] GitHub Actions workflow is properly configured
