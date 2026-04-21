# Webacy SDK

[![npm version](https://img.shields.io/npm/v/@webacy-xyz/sdk)](https://www.npmjs.com/package/@webacy-xyz/sdk)
[![CI](https://github.com/Webacy-Prod/sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Webacy-Prod/sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Official TypeScript/JavaScript SDK for the Webacy Risk Score API. Analyze blockchain addresses, tokens, and transactions for security risks.

**[Documentation](https://docs.webacy.com/sdk/introduction)** | **[API Reference](https://docs.webacy.com)** | **[Get an API Key](https://webacy.com)**

## Installation

Choose the package that fits your needs:

```bash
# Full SDK (recommended) - includes both trading and threat analysis
npm install @webacy-xyz/sdk

# Trading analysis only - holder analysis, sniper/bundler detection
npm install @webacy-xyz/sdk-trading

# Threat analysis only - address risk, sanctions, contracts, URL safety
npm install @webacy-xyz/sdk-threat

# Command-line interface - use the SDK from your terminal
npm install -g @webacy-xyz/cli
```

## Quick Start

### Full SDK

```typescript
import { WebacyClient, Chain, RiskModule } from '@webacy-xyz/sdk';

const client = new WebacyClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Trading: Analyze token holder distribution
const holders = await client.trading.holderAnalysis.get('token_address', {
  chain: 'sol',
});
console.log(`Sniper count: ${holders.sniper_analysis?.sniper_count}`);

// Threat: Analyze address risk
const risk = await client.threat.addresses.analyze('0x742d35Cc...', {
  chain: 'eth',
  modules: [RiskModule.FUND_FLOW_SCREENING],
});
console.log(`Overall risk: ${risk.overallRisk}`);
```

### Trading SDK Only

```typescript
import { TradingClient } from '@webacy-xyz/sdk-trading';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Holder analysis with sniper/bundler detection
const holders = await client.holderAnalysis.get('token_address', {
  chain: 'sol',
});

// Trading lite - simplified Solana analysis
const trading = await client.tradingLite.analyze('pump_token');
console.log(`Sniper % on launch: ${trading.SniperPercentageOnLaunch}`);
console.log(`Bundler % holding: ${trading.BundlerPercentageHolding}`);

// Trending tokens
const trending = await client.tokens.getTrending({ chain: 'sol' });
```

### Threat SDK Only

```typescript
import { ThreatClient, RiskModule } from '@webacy-xyz/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Address risk analysis
const risk = await client.addresses.analyze('0x742d35Cc...', {
  chain: 'eth',
  modules: [RiskModule.SANCTIONS_COMPLIANCE],
});

// Sanctions screening
const sanctioned = await client.addresses.checkSanctioned('0x...', {
  chain: 'eth',
});

// URL safety check
const urlRisk = await client.url.check('https://suspicious-site.com');

// Contract analysis
const contract = await client.contracts.analyze('0xContract...', {
  chain: 'eth',
});
```

### CLI

Every SDK resource method is also exposed as a `webacy` subcommand, so you can script
security checks and pipe JSON into other tools without writing TypeScript:

```bash
# One-time setup
npm install -g @webacy-xyz/cli
export WEBACY_API_KEY=your-key

# Address risk analysis
webacy addresses analyze 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --chain eth --pretty

# Pipe into jq
webacy tokens trending --chain sol --limit 10 | jq '.tokens[] | select(.risk.overallRisk > 50)'

# Batch inputs from a file
webacy batch addresses @./addrs.json --chain eth

# See all 15 command groups
webacy --help
```

Full flag reference lives in [`packages/cli/README.md`](./packages/cli/README.md).

## Packages

| Package | Description |
|---------|-------------|
| `@webacy-xyz/sdk` | Full SDK with trading and threat analysis |
| `@webacy-xyz/sdk-trading` | Token trading analysis (holder analysis, snipers, bundlers) |
| `@webacy-xyz/sdk-threat` | Threat/risk analysis (addresses, contracts, URL safety) |
| `@webacy-xyz/sdk-core` | Shared internals (auto-installed as dependency) |
| `@webacy-xyz/cli` | `webacy` binary wrapping every SDK resource method as a subcommand |

## Features

### Trading Analysis (`@webacy-xyz/sdk-trading`)

- **Holder Analysis** - Token holder distribution, top holders concentration
- **Sniper Detection** - Early buyer analysis with confidence scoring
- **Bundler Detection** - Coordinated buying pattern detection
- **Trading Lite** - Simplified Solana token analysis
- **Token Pools** - Liquidity pool data
- **Trending Tokens** - Trending tokens with risk data

### Threat Analysis (`@webacy-xyz/sdk-threat`)

- **Address Risk** - Comprehensive address risk scoring
- **Sanctions Screening** - OFAC/sanctions compliance
- **Address Poisoning** - Dust attack detection
- **Contract Analysis** - Smart contract vulnerability detection
- **URL Safety** - Phishing and malicious site detection
- **Wallet Transactions** - Transaction risk analysis
- **Token Approvals** - Approval risk monitoring
- **Ledger Scan** - Hardware wallet transaction security
- **Account Trace** - Fund flow tracing
- **API Usage** - Quota management

## Supported Chains

| Chain | Code |
|-------|------|
| Ethereum | `eth` |
| Solana | `sol` |
| Base | `base` |
| BSC | `bsc` |
| Polygon | `pol` |
| Arbitrum | `arb` |
| Optimism | `opt` |
| TON | `ton` |
| Sui | `sui` |
| Stellar | `stellar` |
| Bitcoin | `btc` |

## Error Handling

```typescript
import {
  WebacyClient,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '@webacy-xyz/sdk';

try {
  const risk = await client.threat.addresses.analyze('0x...', { chain: 'eth' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.errors);
  } else if (error instanceof NotFoundError) {
    console.error('Address not found');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof WebacyError) {
    console.error(`API error: ${error.message} (${error.code})`);
  }
}
```

## Configuration

```typescript
const client = new WebacyClient({
  // Required
  apiKey: 'your-api-key',

  // Optional
  baseUrl: 'https://api.webacy.com',  // Custom API URL
  apiVersion: 'v2',                    // API version
  timeout: 30000,                      // Request timeout in ms

  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },

  // Custom headers
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

## Interceptors

```typescript
// Log all requests
client.addRequestInterceptor((url, config) => {
  console.log(`Request: ${url}`);
  return config;
});

// Log all responses
client.addResponseInterceptor((response) => {
  console.log(`Response: ${response.status}`);
  return response;
});

// Handle errors globally
client.addErrorInterceptor((error) => {
  if (error instanceof RateLimitError) {
    console.warn('Rate limited, will retry automatically...');
  }
  return error;
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  HolderAnalysisResult,
  AddressRiskResponse,
  TradingLiteAnalysis,
  Chain,
  RiskModule,
} from '@webacy-xyz/sdk';
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- Modern browsers (Chrome, Firefox, Safari, Edge)

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Webacy-Prod/sdk.git
cd sdk

# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm build

# Run unit tests
pnpm test

# Run integration tests (requires built packages)
pnpm test:integration

# Run real API tests (requires API key in test-real-api.js)
pnpm test:integration:api
```

### Project Structure

```text
webacy-sdk/
├── packages/
│   ├── sdk/        # @webacy-xyz/sdk - unified entry point
│   ├── core/       # @webacy-xyz/sdk-core - shared utilities
│   ├── trading/    # @webacy-xyz/sdk-trading - trading analysis
│   ├── threat/     # @webacy-xyz/sdk-threat - threat analysis
│   └── cli/        # @webacy-xyz/cli - webacy command-line binary
├── examples/       # Usage examples
└── docs/           # Documentation
```

## License

MIT
