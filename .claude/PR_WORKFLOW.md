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

```text
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

```text
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

**Tip:** Use `gh pr create --draft` if your changes are still in progress and you want early feedback before marking the PR ready for review.

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

```text
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

Releases are managed by [Changesets](https://github.com/changesets/changesets) and npm OIDC trusted publishing, driven entirely through GitHub Actions on `main`:

- Add a changeset in your feature PR (`pnpm changeset`)
- Merge to `main` → the release workflow opens/updates a **"Version Packages" PR**
- Merge the "Version Packages" PR → packages are published to npm automatically
- For on-demand testing builds, trigger the **snapshot workflow** manually (`/beta`)

---

## Adding a Changeset

Every PR that changes a published `@webacy-xyz/*` package (`core`, `threat`, `trading`, `sdk`) must include a changeset:

```bash
pnpm changeset
```

You'll be prompted to:

1. Select which packages changed
2. Choose a bump type per package (patch/minor/major)
3. Write a short summary of the change (this becomes the changelog entry)

This creates a markdown file under `.changeset/` — commit it as part of your PR.

Docs/CI/chore PRs that don't touch a published package don't need a changeset. If you want to explicitly record that (e.g. to satisfy a CI check), run:

```bash
pnpm changeset --empty
```

To see what changesets are pending and what they'll bump:

```bash
pnpm changeset status
```

---

## Automatic Release Flow

### 1. Merge to `main`

Once your PR (with its changeset) is merged to `main`, `.github/workflows/release.yml` runs `changesets/action@v1`, which:

- Consumes all pending changesets on `main`
- Opens or updates a single **"Version Packages" PR** that bumps versions, updates each package's `CHANGELOG.md`, and removes the consumed changeset files

### 2. Merge the "Version Packages" PR

Merging this PR triggers the same workflow to run `pnpm ci:publish` (`changeset publish`), which:

- Publishes each changed package to npm under the `latest` tag
- Authenticates via **npm OIDC trusted publishing** — no `NPM_TOKEN` secret, and provenance is attached automatically
- Creates git tags and GitHub Releases for each published package

Because Changesets versions packages independently, `@webacy-xyz/sdk-core` can be at a different version than `@webacy-xyz/sdk-trading`, etc. — there's no more "bump everything together."

---

## Snapshot (Beta) Releases

### `/beta` - Publish a Snapshot

Snapshots are on-demand test builds, triggered manually rather than automatically:

```bash
gh workflow run snapshot.yml --ref {branch_name} -f tag=beta
```

This runs `.github/workflows/snapshot.yml`, which builds the branch, versions changed packages as `x.y.z-beta-<hash>` in snapshot mode, and publishes them under the `beta` dist-tag (or whatever `tag` input you pass) via npm OIDC — no manual `npm version`/`pnpm publish` steps and nothing to revert.

**Installing a snapshot:**

```bash
# Install latest snapshot
npm install @webacy-xyz/sdk@beta

# Install a specific snapshot version
npm install @webacy-xyz/sdk@1.1.0-beta-a1b2c3d
```

Stable installs (`npm install @webacy-xyz/sdk`) are unaffected. See `/beta` (`.claude/commands/beta.md`) for full details.

---

## Release Checklist

Before merging a feature PR that changes a published package:
- [ ] Changeset added (`pnpm changeset`)
- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated

Before merging the "Version Packages" PR:
- [ ] CI passes
- [ ] CHANGELOG.md entries look correct for each bumped package
