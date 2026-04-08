---
sidebar_position: 2
---

# Quick Start

Get up and running with the Webacy SDK in 5 minutes.

## 1. Install the SDK

```bash
npm install @webacy-xyz/sdk
```

## 2. Get Your API Key

Sign up at [webacy.com](https://webacy.com) to get your API key.

## 3. Initialize the Client

```typescript
import { WebacyClient } from '@webacy-xyz/sdk';

const client = new WebacyClient({
  apiKey: process.env.WEBACY_API_KEY!,
});
```

## 4. Make Your First Request

### Analyze Address Risk

```typescript
const risk = await client.threat.addresses.analyze(
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  { chain: 'eth' }
);

console.log(`Overall Risk: ${risk.overallRisk}`);
console.log(`Is Contract: ${risk.isContract}`);
console.log(`High Issues: ${risk.high}`);
console.log(`Medium Issues: ${risk.medium}`);
```

### Analyze Token Holders

```typescript
const holders = await client.trading.holderAnalysis.get(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  { chain: 'sol' }
);

console.log(`Token: ${holders.token_address}`);
console.log(`Sniper Count: ${holders.sniper_analysis?.sniper_count}`);
console.log(`Bundled Buyers: ${holders.first_buyers_analysis?.bundled_buyers_count}`);
```

### Quick Trading Analysis (Solana)

```typescript
const trading = await client.trading.tradingLite.analyze(
  'pump_token_address'
);

console.log(`Sniper % on Launch: ${trading.SniperPercentageOnLaunch}`);
console.log(`Bundler % on Launch: ${trading.BundlerPercentageOnLaunch}`);
console.log(`Dev Launched 24h: ${trading.DevLaunched24Hours}`);
```

## Using Individual Packages

If you only need trading or threat analysis:

### Trading Only

```typescript
import { TradingClient } from '@webacy-xyz/sdk-trading';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const holders = await client.holderAnalysis.get('token', { chain: 'sol' });
```

### Threat Only

```typescript
import { ThreatClient } from '@webacy-xyz/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const risk = await client.addresses.analyze('0x...', { chain: 'eth' });
```

## Next Steps

- [Authentication](/getting-started/authentication) - Configure API keys securely
- [Holder Analysis Guide](/guides/trading/holder-analysis) - Deep dive into token analysis
- [Address Risk Guide](/guides/threat/address-risk) - Understand risk scoring
