---
sidebar_position: 1
slug: /
---

# Webacy SDK

Official TypeScript/JavaScript SDK for the Webacy Risk Score API. Analyze blockchain addresses, tokens, and transactions for security risks.

## Features

### Trading Analysis
- **Holder Analysis** - Token holder distribution, top holders concentration
- **Sniper Detection** - Early buyer analysis with confidence scoring
- **Bundler Detection** - Coordinated buying pattern detection
- **Trading Lite** - Simplified Solana token analysis
- **Token Pools** - Liquidity pool data
- **Trending Tokens** - Trending tokens with risk data

### Threat Analysis
- **Address Risk** - Comprehensive address risk scoring
- **Sanctions Screening** - OFAC/sanctions compliance
- **Address Poisoning** - Dust attack detection
- **Contract Analysis** - Smart contract vulnerability detection
- **URL Safety** - Phishing and malicious site detection
- **Wallet Transactions** - Transaction risk analysis
- **Token Approvals** - Approval risk monitoring
- **Account Trace** - Fund flow tracing

## Quick Install

```bash
# Full SDK (recommended)
npm install @webacy-xyz/sdk

# Or install only what you need
npm install @webacy-xyz/sdk-trading   # Trading features only
npm install @webacy-xyz/sdk-threat    # Threat features only
```

## Quick Example

```typescript
import { WebacyClient } from '@webacy-xyz/sdk';

const client = new WebacyClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Analyze address risk
const risk = await client.threat.addresses.analyze('0x742d35Cc...', {
  chain: 'eth',
});
console.log(`Risk Score: ${risk.overallRisk}`);

// Analyze token holders
const holders = await client.trading.holderAnalysis.get('token_address', {
  chain: 'sol',
});
console.log(`Sniper Count: ${holders.sniper_analysis?.sniper_count}`);
```

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

## Requirements

- Node.js 18+ (uses native `fetch`)
- Modern browsers (Chrome, Firefox, Safari, Edge)
