---
description: Create a pull request with comprehensive description
---

You are helping create a pull request for the Webacy SDK. Your task is to gather information, generate the PR description, push the branch, and create the PR.

## Step 1: Load Context

Load the context from `.claude/.pr-context.json`.

If the file doesn't exist or is incomplete:
- Ask the user for missing information (branch name, commit message)
- Inform them they should run `/start` and `/commit` first for the best experience

## Step 2: Gather Changed Files

Run the following commands to understand what changed:

```bash
git diff --name-only main...HEAD
git diff --stat main...HEAD
```

Show the user the list of changed files.

## Step 3: Gather PR Information

Ask the user for the following information (use AskUserQuestion tool):

### Question 1: What Changed

**Question**: "Summarize what this PR changes"
**Example**: "Added exponential backoff retry logic to the HTTP client for better reliability"

### Question 2: Why

**Question**: "Why are these changes needed?"
**Example**: "To handle transient network failures gracefully"

### Question 3: Testing

**Question**: "How did you test these changes?"
**Example**: "Added unit tests for retry logic, tested manually with flaky network"

### Question 4: Breaking Changes

**Question**: "Are there any breaking changes?"
**Options**: "Yes" / "No"
**Follow-up if Yes**: "Describe the breaking changes"

## Step 4: Generate PR Description

Use the following template:

```markdown
## Summary

{Summary from Question 1}

## Changes

{List of changed files with brief descriptions}

## Why

{Answer from Question 2}

## Testing

{Answer from Question 3}

## Breaking Changes

{From Question 4 - "None" or description}

## Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (for features/fixes)
```

## Step 5: Push Branch

Run the following command:

```bash
git push -u origin {branch_name}
```

## Step 6: Create PR

Format the PR title from the commit message or branch name.

Examples:
- `fix: add retry logic to HTTP client`
- `feat: add batch operations support`

Run the following command:

```bash
gh pr create --base main --title "{PR_TITLE}" --body "$(cat <<'EOF'
{GENERATED_DESCRIPTION}
EOF
)"
```

## Step 7: Confirm and Cleanup

Output a confirmation message:

```
Branch pushed: {branch_name}
PR created: {PR_URL}
Title: {PR_TITLE}

PR #{number} is ready for review!
```

Optionally clean up the context file:

```bash
rm .claude/.pr-context.json
```

## Important Notes

- Always use `--base main` for the PR
- The PR title should follow Conventional Commits format
- Generate a comprehensive description
- Show the PR URL to the user after creation
- If `gh` command fails, provide instructions for manual PR creation

## Error Handling

- If `gh` is not installed, instruct user to install it or create PR manually
- If branch is not pushed, push it first
- If user is not authenticated with GitHub, provide instructions
- If PR creation fails, show the full error message and suggest fixes
