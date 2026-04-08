# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: No Attribution

**NEVER add Claude Code attribution to commits or PRs.** Do not include:

- `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- `Co-Authored-By: Claude ...`
- Any other AI attribution text

Keep commit messages and PR descriptions clean and professional without any AI-generated markers.

## Project Overview

Webacy SDK is a TypeScript SDK for the Webacy API, providing blockchain security and risk analysis capabilities. The SDK is organized as a monorepo with 4 packages:

- **@webacy-xyz/sdk** - Unified SDK that re-exports all packages
- **@webacy-xyz/sdk-core** - Core utilities: HTTP client, errors, Chain enum, retry logic
- **@webacy-xyz/sdk-threat** - Threat analysis: addresses, contracts, sanctions, URL safety
- **@webacy-xyz/sdk-trading** - Trading analysis: holder analysis, sniper detection, trading-lite

### Key Features

- Multi-chain support: ETH, SOL, BTC, ARB, POL, OPT, BASE, BSC, TON, SUI, STELLAR, SEI
- Type-safe Chain enum for all API calls
- ESM and CommonJS dual build support
- Debug/logging mode with granular control
- Default chain configuration
- Comprehensive error handling with retry logic

## Essential Commands

### Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests (87 tests)
pnpm test

# Type check all packages
pnpm typecheck

# Build documentation site
pnpm docs:build

# Clean build artifacts
pnpm clean
```

### Package-specific

```bash
# Build specific package
pnpm --filter @webacy-xyz/sdk-core build

# Test specific package
pnpm --filter @webacy-xyz/sdk-core test

# Run single test file
cd packages/core && npx vitest run src/__tests__/errors.test.ts
```

## Package Structure

```text
packages/
├── core/           # @webacy-xyz/sdk-core
│   ├── src/
│   │   ├── http/           # HTTP client with retry logic
│   │   ├── errors/         # Error classes (WebacyError, ValidationError, etc.)
│   │   ├── types/          # Chain enum, common types
│   │   └── utils/          # Address validation utilities
│   └── __tests__/          # 65 tests
│
├── threat/         # @webacy-xyz/sdk-threat
│   ├── src/
│   │   ├── resources/      # AddressesResource, ContractsResource, etc.
│   │   ├── types/          # Response types for threat endpoints
│   │   └── client.ts       # ThreatClient
│   └── __tests__/          # 10 tests
│
├── trading/        # @webacy-xyz/sdk-trading
│   ├── src/
│   │   ├── resources/      # HolderAnalysisResource, TradingLiteResource
│   │   ├── types/          # Response types for trading endpoints
│   │   └── client.ts       # TradingClient
│   └── __tests__/          # 12 tests
│
├── sdk/            # @webacy-xyz/sdk (unified)
│   └── src/
│       └── index.ts        # Re-exports from all packages
│
└── docs-site/      # Docusaurus documentation
```

## Architecture

### Package Dependency Graph

```text
@webacy-xyz/sdk (unified entry point)
├── @webacy-xyz/sdk-trading (token analysis)
│   └── @webacy-xyz/sdk-core
└── @webacy-xyz/sdk-threat (risk analysis)
    └── @webacy-xyz/sdk-core
```

### Client Hierarchy

```typescript
WebacyClientBase (core)
├── ThreatClient
│   ├── addresses     # AddressesResource
│   ├── contracts     # ContractsResource
│   ├── url           # UrlResource
│   ├── wallets       # WalletsResource
│   └── usage         # UsageResource
│
└── TradingClient
    ├── holderAnalysis  # HolderAnalysisResource
    ├── tradingLite     # TradingLiteResource (Solana only)
    └── tokens          # TokensResource
```

### Key Patterns

1. **Chain Enum**: Type-safe chain identifiers
   ```typescript
   import { Chain } from '@webacy-xyz/sdk';
   client.addresses.analyze('0x...', { chain: Chain.ETH });
   ```

2. **Default Chain**: Set once, omit from calls
   ```typescript
   const client = new ThreatClient({
     apiKey: 'xxx',
     defaultChain: Chain.ETH,
   });
   await client.addresses.analyze('0x...'); // Uses ETH
   ```

3. **Debug Mode**: Granular logging control
   ```typescript
   const client = new ThreatClient({
     apiKey: 'xxx',
     debug: true, // or 'requests' | 'responses' | 'errors'
   });
   ```

4. **Error Handling**: Typed errors with recovery suggestions
   ```typescript
   try {
     await client.addresses.analyze('invalid');
   } catch (error) {
     if (error instanceof ValidationError) {
       console.log(error.getRecoverySuggestion());
     }
   }
   ```

### Important Files

- `packages/core/src/client-base.ts` - Base client all SDKs extend
- `packages/core/src/http/client.ts` - HTTP client with retry logic
- `packages/core/src/types/chain.ts` - Chain enum definition
- `packages/core/src/errors/` - Error class hierarchy
- `packages/core/src/utils/address-validation.ts` - Address validators

## Development Guidelines

### Git Workflow

- **Branch Naming**: `{type}/{description}` (e.g., `fix/add-retry-logic`)
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - `fix:` - Bug fixes
  - `feat:` - New features
  - `chore:` - Maintenance
  - `docs:` - Documentation
  - `test:` - Test changes

### Code Style

- TypeScript strict mode enabled
- ESM-first with CJS compatibility
- One export per file matching filename
- Interfaces over types for objects
- Explicit return types on public methods

### Dual Output

Each package builds to both ESM (`dist/esm/`) and CJS (`dist/cjs/`) with separate `package.json` type markers.

## Testing

- **Framework**: vitest with globals enabled
- **Total Tests**: 87 (65 core + 12 trading + 10 threat)
- **Location**: `src/__tests__/*.test.ts` within each package

## PR Workflow

Use Claude Code slash commands:

```bash
/start    # Create feature branch
/commit   # Stage and commit with conventional format
/finish   # Create PR with comprehensive description
```

See `.claude/PR_WORKFLOW.md` for detailed documentation.

## Publishing Workflow

### Beta Releases (Testing)

```bash
/beta
# Publishes @webacy-xyz/sdk@1.0.0-beta.0 with --tag beta
# Doesn't affect 'latest' tag
# Can run from any branch
```

Install beta: `npm install @webacy-xyz/sdk@beta`

### Stable Releases

```bash
/release
# Bumps version in all packages
# Publishes to npm with 'latest' tag
# Creates git tag
```

### GitHub Release Notes

```bash
/release-notes
# Creates GitHub release with detailed notes
# Run after /release
```

### Manual Publishing

```bash
# Publish in dependency order
pnpm --filter @webacy-xyz/sdk-core publish --access public
pnpm --filter @webacy-xyz/sdk-threat publish --access public
pnpm --filter @webacy-xyz/sdk-trading publish --access public
pnpm --filter @webacy-xyz/sdk publish --access public
```

## Supported Chains

Chain codes: `eth`, `sol`, `base`, `bsc`, `pol`, `arb`, `opt`, `ton`, `sui`, `stellar`, `btc`, `sei`
