---
description: Start a new PR by creating a feature branch following repo conventions
---

You are helping create a new pull request for the Webacy SDK. Your task is to create a properly named feature branch and store context for the next commands.

## Step 1: Gather Information

Ask the user for the following information (use AskUserQuestion tool):

1. **Type**: Ask what type of change this is
   - Options: fix, feat, chore, docs, refactor, test, perf
   - Default: fix

2. **Short Description**: Ask for a brief description (will be converted to kebab-case)
   - Example: "add retry logic"
   - Will become: "add-retry-logic"

3. **Issue Reference** (Optional): Ask if there's a related GitHub issue
   - Example: "#15" or blank

## Step 2: Create Branch

Format the branch name as: `{type}/{description}`

Examples:

- `fix/add-retry-logic`
- `feat/add-batch-operations`
- `chore/update-dependencies`
- `docs/improve-readme`

Run the following commands:

```bash
git checkout main
git pull origin main
git checkout -b {branch_name}
```

## Step 3: Store Context

Create a file `.claude/.pr-context.json` with the following structure:

```json
{
  "branch": "fix/add-retry-logic",
  "type": "fix",
  "description": "add retry logic",
  "issue": "#15",
  "started_at": "2025-01-17T12:00:00Z"
}
```

## Step 4: Confirm

Output a confirmation message:

```text
Created branch: {branch_name}

Next steps:
1. Make your code changes
2. Run `/commit` to stage and commit your changes
3. Run `/finish` to create the pull request
```

## Important Notes

- If the branch already exists, ask the user if they want to switch to it or create a new one
- If `.claude/.pr-context.json` already exists, confirm whether to overwrite it
- Always pull latest main before creating the branch
- Use conventional commit type prefixes for branch names
