# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-30

### Added

- Initial release of Webacy SDK
- **@webacy/sdk** - Unified SDK combining all packages
- **@webacy/sdk-core** - Core utilities, HTTP client, error handling, Chain enum
- **@webacy/sdk-threat** - Threat analysis (addresses, contracts, sanctions, URL safety)
- **@webacy/sdk-trading** - Trading analysis (holder analysis, sniper/bundler detection)

### Features

- Multi-chain support: Ethereum, Solana, Bitcoin, Arbitrum, Polygon, Optimism, Base, BSC, TON, Sui, Stellar, Sei
- Type-safe Chain enum for all API calls
- Comprehensive error handling with retry logic
- ESM and CommonJS dual package support
- Full TypeScript support with detailed type definitions

### Documentation

- Complete API documentation with JSDoc comments
- Example files for all major features
- Docusaurus documentation site

## [Unreleased]

### Added

- **Type Safety**: Chain enum enforced in all option types (prevents string typos)
- **Input Validation**: Address format validation client-side before API calls
- **Error Improvements**:
  - `getRecoverySuggestion()` method on all error types for actionable guidance
  - `endpoint` property included in error objects for debugging
  - JSDoc examples on all error classes
- **Debug/Logging Mode**: Built-in request/response/error logging
  - `debug: true` or `debug: 'all'` to log everything
  - `debug: 'requests'` | `'responses'` | `'errors'` for granular control
  - Custom logger support via `logger` option (works with winston, pino, etc.)
  - Automatic sensitive data redaction in logs
- **Default Chain Support**: Set a default chain in client configuration
  - Configure once: `new ThreatClient({ apiKey: '...', defaultChain: Chain.ETH })`
  - Omit chain from all API calls: `client.addresses.analyze('0x...')`
  - Override per-call: `client.addresses.analyze('0x...', { chain: Chain.SOL })`
  - Throws `ValidationError` with helpful message if no chain provided and no default set
- **Testing**: Added vitest config and 87 passing tests across all packages
- **Documentation**: New guides for error handling, debugging, and default chain configuration
- **Examples**: New example files demonstrating error handling, debugging, and default chain usage

### Improved

- Standardized GitHub repository URLs in all package.json files
- Added bugs/homepage fields to all package.json files
- Added typecheck scripts to all packages
