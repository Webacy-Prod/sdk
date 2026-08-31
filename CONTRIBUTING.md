# Contributing to Webacy SDK

Thank you for your interest in contributing to the Webacy SDK! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm 9.0.0 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/Webacy-Prod/sdk.git
cd sdk

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Project Structure

```text
webacy-sdk/
├── packages/
│   ├── core/           # Core utilities (HTTP client, errors, types)
│   ├── threat/         # Threat analysis (addresses, contracts, sanctions)
│   ├── trading/        # Trading analysis (holder analysis, sniper detection)
│   └── sdk/            # Unified SDK (combines all packages)
├── examples/           # Usage examples
├── docs-site/          # Documentation website
└── package.json        # Root monorepo configuration
```

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for a specific package
cd packages/core && pnpm test
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck
```

### Linting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Building

```bash
# Build all packages
pnpm build

# Clean build artifacts
pnpm clean
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript settings
- Avoid `any` type - use `unknown` for untyped data
- Export types from index files
- Use the `Chain` enum for blockchain identifiers

### Documentation

- Add JSDoc comments to all public APIs
- Include `@param`, `@returns`, and `@example` tags
- Update README files when adding new features

### Testing

- Write unit tests for all new functionality
- Use descriptive test names
- Test edge cases and error conditions

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/my-feature`)
3. **Make** your changes
4. **Run** tests and linting (`pnpm test && pnpm lint`)
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open** a pull request

### Commit Message Format

Use conventional commit format:

```text
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(trading): add holder analysis caching`
- `fix(core): handle timeout errors correctly`
- `docs(readme): update installation instructions`

## Package Dependencies

- `@webacy-xyz/sdk-core` - No dependencies on other SDK packages
- `@webacy-xyz/sdk-threat` - Depends on `@webacy-xyz/sdk-core`
- `@webacy-xyz/sdk-trading` - Depends on `@webacy-xyz/sdk-core`
- `@webacy-xyz/sdk` - Depends on all other packages

When making changes, ensure you don't introduce circular dependencies.

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets) and version bumps follow semver, applied independently per package.

As a contributor, add a changeset describing your change as part of your PR:

```bash
pnpm changeset
# Select the affected package(s), choose a bump type (patch/minor/major),
# and write a short summary. Commit the generated file under .changeset/.
```

Docs/CI/chore PRs that don't touch a published package don't need one (`pnpm changeset --empty` if you want to record that explicitly).

Maintainers publish releases by merging the auto-generated **"Version Packages" PR** (opened/updated on every merge to `main` by GitHub Actions), which bumps versions, updates each package's `CHANGELOG.md`, and publishes the changed packages to npm.

### Beta / snapshot releases

Need to hand someone a build before merging to `main`? Publish an on-demand snapshot (beta) release instead of waiting for a stable version.

A snapshot requires a changeset on the branch being built — `changeset version --snapshot` reads pending `.changeset/*.md` files, and with none it no-ops and nothing gets published. Add one first if you haven't already:

```bash
pnpm changeset
```

Trigger the snapshot job, which lives inside `.github/workflows/release.yml` (triggered via `workflow_dispatch`, not a separate workflow file):

- **GitHub UI**: Actions → "Release" workflow → "Run workflow" → pick your feature branch → keep `snapshot=true`, `tag=beta`.
- **CLI**:
  ```bash
  gh workflow run release.yml --repo Webacy-Prod/sdk --ref <your-branch> -f snapshot=true -f tag=beta
  ```

Always dispatch from the feature branch itself (the `--ref`), so its changesets are the ones built.

This publishes each changed package as `x.y.z-beta-<datetime>` (e.g. `@webacy-xyz/sdk@1.9.1-beta-20260717171903`) under the `beta` npm dist-tag, without touching `latest`. Install it with:

```bash
npm install @webacy-xyz/sdk@beta
```

Snapshots are ephemeral — nothing is committed back to the branch. To ship the change for real, just merge the PR with its changeset to `main` as usual; the normal "Version Packages" flow publishes the real version to `latest`. Snapshots never become the stable version.

For a sustained beta ramp toward a specific version instead of one-off builds, Changesets also supports **pre-release mode** (`changeset pre enter beta`, accumulate changesets, versions like `1.10.0-beta.0`/`.1`, then `changeset pre exit`). Snapshot releases are the default for quick on-demand betas; pre-release mode is for a more formal beta cycle, and the two shouldn't be run on the same branch at once.

## Getting Help

- Open an [issue](https://github.com/Webacy-Prod/sdk/issues) for bugs or feature requests
- Join discussions in existing issues before starting work

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
