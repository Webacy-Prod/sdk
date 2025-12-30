---
description: Publish a beta version for testing without affecting the latest tag
---

You are helping publish a beta version of the Webacy SDK for testing. Beta versions allow testing new features before a stable release.

## Step 1: Verify Current State

Check the current branch and status:

```bash
git branch --show-current
git status
```

**Note**: Beta releases can be made from any branch (feature branches, main, etc.)

If there are uncommitted changes:
```text
You have uncommitted changes. Please commit or stash them first.
```

## Step 2: Get Current Version Info

Read current version and determine beta version:

```bash
CURRENT_VERSION=$(node -p "require('./package.json').version")
```

Check for existing beta tags:

```bash
git tag -l "v${CURRENT_VERSION}-beta.*" | sort -V | tail -1
```

Calculate next beta version:
- If no existing beta: `{CURRENT_VERSION}-beta.0`
- If beta.N exists: `{CURRENT_VERSION}-beta.{N+1}`

Show the user:
```text
Current stable version: 1.0.0
Next beta version will be: 1.0.0-beta.0

Or specify a custom prerelease identifier (e.g., "alpha", "rc")
```

## Step 3: Ask for Beta Type (Optional)

Ask the user (use AskUserQuestion tool):

- **Question**: "What type of prerelease?"
- **Options**:
  - **beta**: Standard beta (1.0.0-beta.0)
  - **alpha**: Early alpha (1.0.0-alpha.0)
  - **rc**: Release candidate (1.0.0-rc.0)
  - **Custom**: Let user specify

## Step 4: Run Tests

Run the test suite:

```bash
pnpm test
```

If tests fail, warn but allow continuing (betas can have known issues):
```text
Tests failed. Do you want to continue with the beta release anyway?
This is not recommended for production testing.
```

## Step 5: Build All Packages

Build all packages:

```bash
pnpm build
```

If build fails:
```text
Build failed. Cannot publish a broken beta.
```

## Step 6: Update Versions for Beta

Update version in all package.json files with the beta version:

```bash
# Calculate beta version
BETA_VERSION="{CURRENT_VERSION}-beta.{N}"

# Update root package.json
npm version ${BETA_VERSION} --no-git-tag-version

# Update each package
cd packages/core && npm version ${BETA_VERSION} --no-git-tag-version && cd ../..
cd packages/threat && npm version ${BETA_VERSION} --no-git-tag-version && cd ../..
cd packages/trading && npm version ${BETA_VERSION} --no-git-tag-version && cd ../..
cd packages/sdk && npm version ${BETA_VERSION} --no-git-tag-version && cd ../..
```

Also update inter-package dependencies to the beta version.

## Step 7: Publish to npm with Beta Tag

Publish each package with the `beta` tag (NOT `latest`):

```bash
# Core first
cd packages/core && pnpm publish --access public --tag beta && cd ../..

# Threat and Trading
cd packages/threat && pnpm publish --access public --tag beta && cd ../..
cd packages/trading && pnpm publish --access public --tag beta && cd ../..

# SDK last
cd packages/sdk && pnpm publish --access public --tag beta && cd ../..
```

**IMPORTANT**: The `--tag beta` flag ensures:
- Users running `npm install @webacy/sdk` get the stable version
- Users must explicitly install `npm install @webacy/sdk@beta` to get this version

## Step 8: Create Git Tag (Optional)

Ask user if they want to create a git tag:

```bash
git tag v{BETA_VERSION}
git push origin v{BETA_VERSION}
```

## Step 9: Revert Version Changes

After publishing, revert the package.json changes so the repo stays on the stable version:

```bash
git checkout -- package.json packages/*/package.json pnpm-lock.yaml
```

## Step 10: Confirm

Output a confirmation message:

```text
Beta v{BETA_VERSION} published!

Published packages (tagged as 'beta'):
- @webacy/sdk@{BETA_VERSION}
- @webacy/sdk-core@{BETA_VERSION}
- @webacy/sdk-threat@{BETA_VERSION}
- @webacy/sdk-trading@{BETA_VERSION}

To install the beta version:
  npm install @webacy/sdk@beta
  # or
  npm install @webacy/sdk@{BETA_VERSION}

To install the stable version (unchanged):
  npm install @webacy/sdk

Note: Package.json files have been reverted to stable version.
```

## Important Notes

- Beta versions use npm's `--tag beta` to avoid affecting `latest`
- Users must explicitly opt-in to beta: `npm install @webacy/sdk@beta`
- Package.json is reverted after publish to keep repo on stable version
- Beta can be published from any branch (feature branches, main, etc.)
- Multiple betas can be published: beta.0, beta.1, beta.2, etc.

## npm Tag System

| Tag | Purpose | Install Command |
|-----|---------|-----------------|
| `latest` | Stable releases | `npm install @webacy/sdk` |
| `beta` | Beta testing | `npm install @webacy/sdk@beta` |
| `alpha` | Early testing | `npm install @webacy/sdk@alpha` |
| `rc` | Release candidates | `npm install @webacy/sdk@rc` |

## Error Handling

- If build fails: Stop, cannot publish broken code
- If tests fail: Warn but allow continue (user's choice)
- If npm publish fails: Check `npm whoami`, may need login
- If tag already exists: Increment beta number

## Example Flow

```bash
# On feature branch with new feature to test
/beta
# Select: beta
# Tests pass, build succeeds
# Publishes: @webacy/sdk@1.0.0-beta.0

# After more changes
/beta
# Publishes: @webacy/sdk@1.0.0-beta.1

# Ready for stable release
/release
# Publishes: @webacy/sdk@1.1.0 (as latest)
```

## Promoting Beta to Stable

If a beta is ready to become the stable release:

```bash
# Option 1: Use /release command (recommended)
# This creates a proper stable release with changelog

# Option 2: Manually promote the tag (advanced)
npm dist-tag add @webacy/sdk@1.0.0-beta.5 latest
```
