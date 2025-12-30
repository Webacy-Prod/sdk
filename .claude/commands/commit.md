---
description: Stage and commit changes with proper formatting following conventional commits
---

You are helping commit changes for the Webacy SDK. Your task is to stage all changes and create a properly formatted commit message.

## Step 1: Check for Context

Load the context from `.claude/.pr-context.json` if it exists.

If the file doesn't exist:
- Ask the user for the change type (fix, feat, chore, docs, refactor, test, perf)
- Store this information for later use

## Step 2: Show Changed Files

Run the following command to show what will be staged:

```bash
git status
git diff --name-only
```

Display the list of modified files to the user:

```
The following files will be staged:
- packages/core/src/http/client.ts
- packages/core/src/__tests__/retry.test.ts

Do you want to proceed?
```

## Step 3: Run Tests

Before committing, run the test suite:

```bash
pnpm test
```

If tests fail:
1. Show the user the failing tests
2. Ask if they want to fix them or commit anyway (not recommended)

## Step 4: Ask for Commit Message

Ask the user for a commit message summary (use AskUserQuestion tool):

- Question: "What is the summary of your changes?"
- Example: "Add retry logic to HTTP client"

## Step 5: Format Commit Message

Format the commit message following [Conventional Commits](https://www.conventionalcommits.org/):

```
{type}: {summary}
```

Examples:

- `fix: add retry logic to HTTP client`
- `feat: add batch operations support`
- `docs: improve error handling guide`
- `chore: update dependencies`

Type mapping:
- fix -> fix
- feat -> feat
- feature -> feat
- chore -> chore
- docs -> docs
- refactor -> refactor
- test -> test
- perf -> perf

## Step 6: Stage and Commit

Run the following commands:

```bash
git add {list of modified files}
git commit -m "{formatted commit message}"
```

## Step 7: Update Context

Update `.claude/.pr-context.json` with the commit information:

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

## Step 8: Confirm

Output a confirmation message:

```
Staged {N} files
Committed with message: {commit_message}

Next step:
Run `/finish` to create the pull request
```

## Important Notes

- Always show the user what files will be staged before committing
- Run tests before committing (can be skipped if user insists)
- The commit message MUST follow Conventional Commits format
- Do NOT use co-authored-by in the commit message
- If there are no changes to commit, inform the user
