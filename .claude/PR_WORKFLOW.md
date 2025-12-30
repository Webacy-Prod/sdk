# PR Workflow Guide

## Quick Reference

This repo has an automated 3-step PR workflow using Claude Code slash commands:

### Step 1: `/start` - Create Branch

Creates a properly named feature branch and stores context

### Step 2: `/commit` - Commit Changes

Stages all changes and commits with proper format

### Step 3: `/finish` - Create PR

Generates comprehensive PR description and creates the pull request

---

## Detailed Workflow

### 1. `/start` - Create Feature Branch

**What it does:**

- Creates a properly named branch following repo conventions
- Stores ticket info for later commands (optional)

**Usage:**

```bash
/start
```

**Prompts:**

- Type: fix/feature/chore/docs
- Short description (e.g., "add retry logic")
- Optional: Issue/ticket reference

**Creates:**

- Branch: `fix/add-retry-logic`
- Context file: `.claude/.pr-context.json`

**Output:**

```
Created branch: fix/add-retry-logic

Next steps:
1. Make your code changes
2. Run `/commit` to stage and commit
3. Run `/finish` to create the PR
```

---

### 2. `/commit` - Stage and Commit Changes

**What it does:**

- Shows you what files will be staged
- Creates properly formatted commit message
- Runs tests before committing

**Usage:**

```bash
/commit
```

**Prompts:**

- Commit message summary (e.g., "Add retry logic to HTTP client")

**Runs:**

```bash
pnpm test
git add [modified files]
git commit -m "fix: add retry logic to HTTP client"
```

**Output:**

```
Staged 5 files
Committed with message: fix: add retry logic to HTTP client

Next step:
Run `/finish` to create the pull request
```

---

### 3. `/finish` - Create Pull Request

**What it does:**

- Generates comprehensive PR description
- Pushes branch to remote
- Creates PR against `main` branch

**Usage:**

```bash
/finish
```

**Prompts:**

1. **What Changed**: Summary of changes
2. **Why**: Reason for the changes
3. **Testing**: How you tested
4. **Breaking Changes**: Yes/No

**Runs:**

```bash
git push -u origin fix/add-retry-logic
gh pr create --base main --title "fix: add retry logic" --body "..."
```

**Output:**

```
Branch pushed: fix/add-retry-logic
PR created: https://github.com/Webacy-Prod/sdk/pull/2

PR #2 is ready for review!
```

---

## Example: Complete Workflow

```bash
# 1. Start new PR
/start
# Enter: fix
# Enter: add retry logic

# 2. Make your code changes
# [Edit files...]

# 3. Commit changes
/commit
# Enter: Add retry logic to HTTP client

# 4. Create PR
/finish
# Enter what changed: Added exponential backoff retry logic
# Enter why: Improve reliability for transient failures
# Enter testing: Added unit tests, tested manually
# Enter breaking changes: No

# Done! PR created: https://github.com/.../pull/2
```

---

## Branch Naming Convention

Format: `{type}/{description}`

Examples:

- `fix/add-retry-logic`
- `feature/add-batch-operations`
- `chore/update-dependencies`
- `docs/improve-error-handling-guide`

---

## Commit Message Format

Format: `{type}: {summary}`

Uses [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` - Bug fixes
- `feat:` - New features
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `perf:` - Performance improvements

Examples:

- `fix: add retry logic to HTTP client`
- `feat: add batch operations support`
- `docs: improve error handling guide`

---

## Context File (.claude/.pr-context.json)

The workflow stores context between commands:

```json
{
  "branch": "fix/add-retry-logic",
  "type": "fix",
  "description": "add retry logic",
  "started_at": "2025-01-17T12:00:00Z",
  "commit_message": "fix: add retry logic to HTTP client",
  "committed_at": "2025-01-17T12:30:00Z"
}
```

This file is automatically cleaned up after `/finish` completes.

---

## Tips

- **Run commands in order**: `/start` -> `/commit` -> `/finish`
- **You can skip steps**: If you already have a branch, just run `/commit` and `/finish`
- **Multiple commits**: Run `/commit` multiple times before `/finish`
- **Always run tests**: Tests run automatically during `/commit`

---

# Release Workflow

## Quick Reference - Release Commands

For publishing to npm, use these automated release commands:

### `/release` - Create Release and Publish

Creates release, bumps version, and publishes to npm

### `/release-notes` - Create GitHub Release

Creates GitHub release with detailed notes

---

## Complete Release Workflow

### 1. `/release` - Create Release and Publish

**What it does:**

- Verifies you're on main branch and up-to-date
- Asks for version bump type (major/minor/patch)
- Runs full test suite
- Builds all packages
- Bumps version in all packages
- Publishes to npm
- Creates git tag

**Usage:**

```bash
# From main branch
/release
```

**Prompts:**

- **Version type**: patch (bug fixes), minor (new features), or major (breaking changes)

**Example Flow:**

```
Current version: 1.0.0
New version will be: 1.1.0

Running tests...
Building packages...
Publishing to npm...

Published packages:
- @webacy/sdk@1.1.0
- @webacy/sdk-core@1.1.0
- @webacy/sdk-threat@1.1.0
- @webacy/sdk-trading@1.1.0

Tag v1.1.0 created and pushed
```

---

### 2. `/release-notes` - Create GitHub Release

**What it does:**

- Gets version from package.json
- Extracts changes since last release
- Creates GitHub release with detailed notes

**Usage:**

```bash
# From main branch (after release)
/release-notes
```

**Example Output:**

```
GitHub release v1.1.0 created
Release URL: https://github.com/Webacy-Prod/sdk/releases/tag/v1.1.0
```

---

## Version Bump Types

When running `/release`, you'll choose:

- **patch** (1.0.0 -> 1.0.1): Bug fixes, no new features
- **minor** (1.0.0 -> 1.1.0): New features, backward-compatible
- **major** (1.0.0 -> 2.0.0): Breaking changes

---

## Release Checklist

Before releasing:
- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No uncommitted changes
