---
description: Publish an on-demand snapshot/beta release via the release workflow
---

You are helping publish a snapshot (beta) version of the Webacy SDK for testing. Snapshot releases let people install work-in-progress changes before a stable release, without touching the `latest` npm tag.

## How it works

Snapshot releases are a job inside `.github/workflows/release.yml`, triggered manually via `workflow_dispatch` (inputs: `snapshot`, default `true`, and `tag`, default `beta`). There is no separate `snapshot.yml` workflow — it lives in `release.yml` because npm allows only one trusted publisher per package, bound to that workflow's filename, so the OIDC token's workflow claim has to match `release.yml` for betas to publish without a token.

The job versions the changed packages as `x.y.z-beta-<datetime>` using Changesets snapshot mode and publishes them under the `beta` dist-tag (or whatever tag you provide) via npm OIDC trusted publishing. There is no local `npm version`/`pnpm publish` step and nothing to revert afterward — the workflow does not commit anything back to the branch.

**Prerequisite**: a snapshot requires a changeset already present on the branch being built. `changeset version --snapshot` only versions packages with pending `.changeset/*.md` files — with none, it no-ops ("No unreleased changesets found") and nothing publishes.

## Step 1: Verify Current State

Check the current branch, status, and that a changeset exists:

```bash
git branch --show-current
git status
ls .changeset/*.md 2>/dev/null
```

If there's no changeset yet, add one:

```bash
pnpm changeset
```

**Note**: Snapshots can be triggered from any branch (feature branches, main, etc.) — push your branch first so the workflow can check it out.

```bash
git push -u origin {branch_name}
```

## Step 2: Trigger the Snapshot Job

Run the workflow via `gh`, dispatching from your feature branch so its changesets are the ones built:

```bash
gh workflow run release.yml --repo Webacy-Prod/sdk --ref {branch_name} -f snapshot=true -f tag=beta
```

- `--ref` selects the branch to build from — always your feature branch.
- `-f snapshot=true` runs the snapshot job instead of a normal release.
- `-f tag=beta` sets the npm dist-tag (defaults to `beta`). Use a different value (e.g. `alpha`, `rc`) for a differently-tagged snapshot.

## Step 3: Watch the Run

```bash
gh run watch $(gh run list --workflow=release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

Or check progress in the GitHub Actions UI (Actions → "Release" workflow).

## Step 4: Confirm

Once the workflow completes, it will have published each changed package as a snapshot version (e.g. `@webacy-xyz/sdk@1.9.1-beta-20260717171903`) under the `beta` tag.

```text
Snapshot published!

To install the latest snapshot:
  npm install @webacy-xyz/sdk@beta

To install a specific snapshot version:
  npm install @webacy-xyz/sdk@1.9.1-beta-20260717171903

Stable version is unaffected:
  npm install @webacy-xyz/sdk
```

## Promoting a Snapshot to Stable

Snapshots are for testing only. To ship the change for real, nothing special is needed — merge the PR with its existing changeset to `main` as usual, and the normal "Version Packages" flow publishes the real version under `latest`. Snapshots never become the stable version.

## Advanced Alternative: Pre-release Mode

For a sustained beta ramp toward a specific version (rather than one-off builds), Changesets supports pre-release mode: `changeset pre enter beta`, accumulate changesets normally, versions come out as `1.10.0-beta.0`, `.1`, etc., then `changeset pre exit` when done. Snapshot mode (this command) is for quick on-demand betas; don't run a snapshot while pre-release mode is active on the same branch.

## Important Notes

- Snapshots are published via `workflow_dispatch` on `.github/workflows/release.yml` (`snapshot=true`) — there is no automatic snapshot publish from any branch, and no separate `snapshot.yml` workflow.
- Publishing uses npm OIDC trusted publishing; no `NPM_TOKEN` is needed and provenance is automatic.
- Snapshot versions never affect the `latest` dist-tag.
- Multiple snapshots can be published from the same branch as it evolves; each gets a new datetime-based version.

## Error Handling

- If `gh workflow run` fails: confirm you have `gh` authenticated and Actions write access.
- If the workflow fails: check the run logs (`gh run view --log-failed`) for build or publish errors.
- If nothing gets published: confirm there's a pending changeset on the branch — without one, `changeset version --snapshot` no-ops.
