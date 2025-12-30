---
description: Create GitHub release with detailed notes after publishing to npm
---

You are helping create a GitHub release for the Webacy SDK. This command should be run AFTER the packages have been published to npm.

## Step 1: Verify Current State

Check that you're on main branch and it's up-to-date:

```bash
git branch --show-current
git pull origin main
```

If not on main:
```
You should be on main branch after publishing.
Please run: git checkout main && git pull
```

## Step 2: Get Current Version

Read the version from package.json:

```bash
VERSION=$(node -p "require('./package.json').version")
TAG_NAME="v${VERSION}"
```

Show the user:
```
Current version: {VERSION}
Release tag: v{VERSION}
```

## Step 3: Verify Tag Exists

Check if the git tag exists:

```bash
git tag -l v{VERSION}
```

If tag doesn't exist:
```
Tag v{VERSION} not found. Did you run `/release` first?
```

## Step 4: Get Previous Release Version

Find the previous release tag:

```bash
git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 2 | tail -n 1
```

## Step 5: Extract Changes

Get commits between previous and current release:

```bash
git log {PREV_TAG}..v{VERSION} --pretty=format:"%s" --no-merges
```

Categorize commits:

### Bug Fixes
- Lines starting with `fix:`

### Features
- Lines starting with `feat:`

### Other Changes
- `chore:`, `docs:`, `refactor:`, `test:`, `perf:`

## Step 6: Read CHANGELOG

Read the relevant section from CHANGELOG.md for this version to include in release notes.

## Step 7: Generate Release Notes

Use the following template:

```markdown
## What's New in v{VERSION}

{Summary from CHANGELOG or auto-generated}

### Features

{List of new features}

### Bug Fixes

{List of bug fixes}

### Other Changes

{List of other changes}

## Installation

```bash
npm install @webacy/sdk@{VERSION}
# or
pnpm add @webacy/sdk@{VERSION}
```

## Packages

| Package | Version |
|---------|---------|
| @webacy/sdk | {VERSION} |
| @webacy/sdk-core | {VERSION} |
| @webacy/sdk-threat | {VERSION} |
| @webacy/sdk-trading | {VERSION} |

**Full Changelog**: https://github.com/Webacy-Prod/sdk/compare/{PREV_TAG}...v{VERSION}
```

## Step 8: Create GitHub Release

Create the release using gh CLI:

```bash
gh release create v{VERSION} --title "v{VERSION}" --notes "$(cat <<'EOF'
{GENERATED_NOTES}
EOF
)"
```

## Step 9: Confirm

Output a confirmation message:

```
GitHub release v{VERSION} created!
Release URL: https://github.com/Webacy-Prod/sdk/releases/tag/v{VERSION}

npm packages published:
- https://www.npmjs.com/package/@webacy/sdk
- https://www.npmjs.com/package/@webacy/sdk-core
- https://www.npmjs.com/package/@webacy/sdk-threat
- https://www.npmjs.com/package/@webacy/sdk-trading

Release complete!
```

## Important Notes

- Run this AFTER `/release` has published to npm
- The git tag must exist before creating the GitHub release
- Include installation instructions in release notes
- Link to npm packages and changelog

## Error Handling

- If tag doesn't exist: Instruct to run `/release` first
- If `gh release create` fails: Provide manual instructions
- If previous tag not found: Skip "Full Changelog" link

## Example Release Notes

```markdown
## What's New in v1.1.0

This release adds debug logging support and improves error handling.

### Features

- feat: add debug/logging mode with granular control
- feat: add default chain configuration support

### Bug Fixes

- fix: improve error messages with recovery suggestions
- fix: add input validation for addresses

### Other Changes

- docs: add error handling guide
- docs: add debugging guide
- test: add 87 tests across all packages

## Installation

```bash
npm install @webacy/sdk@1.1.0
```

## Packages

| Package | Version |
|---------|---------|
| @webacy/sdk | 1.1.0 |
| @webacy/sdk-core | 1.1.0 |
| @webacy/sdk-threat | 1.1.0 |
| @webacy/sdk-trading | 1.1.0 |

**Full Changelog**: https://github.com/Webacy-Prod/sdk/compare/v1.0.0...v1.1.0
```
