# @webacy-xyz/sdk

The official TypeScript/JavaScript SDK for the Webacy Risk Score API. This is the full SDK that includes both trading and threat analysis capabilities.

## Installation

```bash
npm install @webacy-xyz/sdk
```

Or install only what you need:

```bash
npm install @webacy-xyz/sdk-trading   # Trading analysis only
npm install @webacy-xyz/sdk-threat    # Threat analysis only
```

Prefer the terminal? Install the CLI instead:

```bash
npm install -g @webacy-xyz/cli
webacy addresses analyze 0x... --chain eth
```

The `webacy` binary exposes every `ThreatClient` and `TradingClient` method as a
subcommand. See [`@webacy-xyz/cli`](https://www.npmjs.com/package/@webacy-xyz/cli).

## Quick Start

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
console.log(`Risk score: ${risk.overallRisk}/100`);
```

## Features

### Trading Analysis

- **Holder Analysis** - Token holder distribution with sniper/bundler detection
- **Trading Lite** - Simplified Solana token analysis
- **Token Pools** - Liquidity pool data
- **Trending Tokens** - Discover trending tokens

```typescript
// Holder analysis
const holders = await client.trading.holderAnalysis.get('token', { chain: 'sol' });

// Trading lite (Solana)
const trading = await client.trading.tradingLite.analyze('pump_token');

// Trending tokens
const trending = await client.trading.tokens.getTrending({ chain: 'sol' });
```

### Threat Analysis

- **Address Risk** - Comprehensive address security scoring
- **Sanctions Screening** - OFAC compliance checking
- **Address Poisoning** - Dust attack detection
- **Contract Analysis** - Smart contract vulnerability detection
- **URL Safety** - Phishing and malware detection
- **Wallet Analysis** - Transaction and approval risk

```typescript
// Address risk
const risk = await client.threat.addresses.analyze('0x...', { chain: 'eth' });

// Sanctions check
const sanctioned = await client.threat.addresses.checkSanctioned('0x...', { chain: 'eth' });

// URL safety
const urlRisk = await client.threat.url.check('https://suspicious-site.com');

// Contract analysis
const contract = await client.threat.contracts.analyze('0x...', { chain: 'eth' });
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
  },
});
```

## Error Handling

```typescript
import {
  WebacyClient,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
} from '@webacy-xyz/sdk';

try {
  const risk = await client.threat.addresses.analyze('0x...', { chain: 'eth' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.error('Invalid request:', error.errors);
  } else if (error instanceof NotFoundError) {
    console.error('Address not found');
  }
}
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
    console.warn('Rate limited, will retry...');
  }
  return error;
});
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  // Trading types
  HolderAnalysisResult,
  TradingLiteAnalysis,
  SniperAnalysis,
  FirstBuyersAnalysis,

  // Threat types
  AddressRiskResponse,
  SanctionedResponse,
  ContractRiskResponse,
  UrlRiskResponse,

  // Common types
  Chain,
  RiskModule,
  RiskTag,
} from '@webacy-xyz/sdk';
```

## Supported Chains

| Chain | Code | Trading | Threat |
|-------|------|---------|--------|
| Ethereum | `eth` | Yes | Yes |
| Solana | `sol` | Yes | Yes |
| Base | `base` | Yes | Yes |
| BSC | `bsc` | Yes | Yes |
| Polygon | `pol` | Yes | Yes |
| Arbitrum | `arb` | Yes | Yes |
| Optimism | `opt` | Yes | Yes |
| TON | `ton` | - | Yes |
| Sui | `sui` | - | Yes |
| Stellar | `stellar` | - | Yes |
| Bitcoin | `btc` | - | Yes |

## Requirements

- Node.js 18+ (uses native `fetch`)
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT
