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

Releases are managed by maintainers. Version bumps follow semver:

```bash
# Patch release (bug fixes)
pnpm version:patch

# Minor release (new features)
pnpm version:minor

# Major release (breaking changes)
pnpm version:major
```

## Getting Help

- Open an [issue](https://github.com/Webacy-Prod/sdk/issues) for bugs or feature requests
- Join discussions in existing issues before starting work

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
