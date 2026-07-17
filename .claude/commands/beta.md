---
description: Publish an on-demand snapshot/beta release via the snapshot workflow
---

You are helping publish a snapshot (beta) version of the Webacy SDK for testing. Snapshot releases let people install work-in-progress changes before a stable release, without touching the `latest` npm tag.

## How it works

Snapshot releases are published by the `.github/workflows/snapshot.yml` GitHub Actions workflow, triggered manually via `workflow_dispatch`. It builds the current state of the branch, versions the changed packages as `x.y.z-beta-<hash>` using Changesets snapshot mode, and publishes them under the `beta` dist-tag (or whatever tag you provide) via npm OIDC trusted publishing. There is no local `npm version`/`pnpm publish` step and nothing to revert afterward — the workflow does not commit anything back to the branch.

## Step 1: Verify Current State

Check the current branch and status:

```bash
git branch --show-current
git status
```

**Note**: Snapshots can be triggered from any branch (feature branches, main, etc.) — push your branch first so the workflow can check it out.

```bash
git push -u origin {branch_name}
```

## Step 2: Trigger the Snapshot Workflow

Run the workflow via `gh`:

```bash
gh workflow run snapshot.yml --ref {branch_name} -f tag=beta
```

- `--ref` selects the branch to build from.
- `-f tag=beta` sets the npm dist-tag (defaults to `beta` if omitted). Use a different value (e.g. `alpha`, `rc`) for a differently-tagged snapshot.

## Step 3: Watch the Run

```bash
gh run watch $(gh run list --workflow=snapshot.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

Or check progress in the GitHub Actions UI.

## Step 4: Confirm

Once the workflow completes, it will have published each changed package as a snapshot version (e.g. `@webacy-xyz/sdk@1.1.0-beta-a1b2c3d`) under the `beta` tag.

```text
Snapshot published!

To install the latest snapshot:
  npm install @webacy-xyz/sdk@beta

To install a specific snapshot version:
  npm install @webacy-xyz/sdk@1.1.0-beta-a1b2c3d

Stable version is unaffected:
  npm install @webacy-xyz/sdk
```

## Promoting a Snapshot to Stable

Snapshots are for testing only. To ship the change for real, add a changeset (`pnpm changeset`) and merge to `main` as usual — the release workflow will handle versioning and publishing under `latest`. Do not promote a snapshot dist-tag manually.

## Important Notes

- Snapshots are published via `workflow_dispatch` on `.github/workflows/snapshot.yml` — there is no automatic snapshot publish from any branch.
- Publishing uses npm OIDC trusted publishing; no `NPM_TOKEN` is needed and provenance is automatic.
- Snapshot versions never affect the `latest` dist-tag.
- Multiple snapshots can be published from the same branch as it evolves; each gets a new content hash.

## Error Handling

- If `gh workflow run` fails: confirm you have `gh` authenticated and Actions write access.
- If the workflow fails: check the run logs (`gh run view --log-failed`) for build or publish errors.
- If no packages changed relative to their published version, the workflow may have nothing to snapshot.
