---
description: Create a release, bump version, and publish to npm
---

You are helping create a release for the Webacy SDK. Your task is to bump the version, run tests, build, and publish all packages to npm.

## Step 1: Verify Current State

Check that you're on main branch and it's clean:

```bash
git branch --show-current
git fetch origin
git status
```

If not on main:
```
You must be on main branch to create a release.
Please run: git checkout main && git pull
```

If there are uncommitted changes:
```
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

Read current version from root package.json and calculate new version:

```bash
CURRENT_VERSION=$(node -p "require('./package.json').version")
```

Show the user:
```
Current version: 1.0.0
New version will be: 1.1.0
```

## Step 4: Run Tests

Run the full test suite:

```bash
pnpm test
```

If tests fail:
```
Tests failed. Please fix failing tests before releasing.
```

## Step 5: Build All Packages

Build all packages:

```bash
pnpm build
```

If build fails:
```
Build failed. Please fix build errors before releasing.
```

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

## Step 7: Update CHANGELOG

Ask the user to provide release notes or auto-generate from commits:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s" --no-merges
```

Update CHANGELOG.md with the new version section.

## Step 8: Commit Version Bump

```bash
git add .
git commit -m "chore: release v{VERSION}"
```

## Step 9: Create Git Tag

```bash
git tag v{VERSION}
```

## Step 10: Publish to npm

Publish each package in dependency order:

```bash
# Core first (no dependencies)
cd packages/core && pnpm publish --access public && cd ../..

# Threat and Trading (depend on core)
cd packages/threat && pnpm publish --access public && cd ../..
cd packages/trading && pnpm publish --access public && cd ../..

# SDK last (depends on all)
cd packages/sdk && pnpm publish --access public && cd ../..
```

## Step 11: Push to Remote

```bash
git push origin main --follow-tags
```

## Step 12: Confirm

Output a confirmation message:

```
Release v{VERSION} completed!

Published packages:
- @webacy/sdk@{VERSION}
- @webacy/sdk-core@{VERSION}
- @webacy/sdk-threat@{VERSION}
- @webacy/sdk-trading@{VERSION}

Git tag v{VERSION} pushed to origin

Next step:
Run `/release-notes` to create the GitHub release
```

## Important Notes

- Always run tests and build before releasing
- Publish packages in dependency order (core -> threat/trading -> sdk)
- Version must be bumped in ALL packages
- Inter-package dependencies must also be updated
- Git tag format is `v{VERSION}` (e.g., `v1.1.0`)

## Error Handling

- If not on main: Instruct to checkout main
- If tests fail: Stop release, show failures
- If build fails: Stop release, show errors
- If npm publish fails: Show error, may need `npm login`
- If tag already exists: Ask user to choose different version

## Pre-release Checklist

Before running `/release`:
- [ ] All features/fixes are merged to main
- [ ] CHANGELOG.md is up to date
- [ ] Documentation is updated
- [ ] All tests pass locally
- [ ] You are logged into npm (`npm whoami`)
