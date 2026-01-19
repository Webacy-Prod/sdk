# @webacy-xyz/sdk-trading

Token trading analysis SDK for the Webacy Risk Score API. Analyze token holder distribution, detect snipers and bundlers, and identify trading patterns.

## Installation

```bash
npm install @webacy-xyz/sdk-trading
```

Or install the full SDK:

```bash
npm install @webacy-xyz/sdk
```

## Quick Start

```typescript
import { TradingClient } from '@webacy-xyz/sdk-trading';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Analyze token holder distribution
const holders = await client.holderAnalysis.get('token_address', {
  chain: 'sol',
});

console.log(`Sniper count: ${holders.sniper_analysis?.sniper_count}`);
console.log(`Bundled buyers: ${holders.first_buyers_analysis.bundled_buyers_count}`);
```

## Features

### Holder Analysis

Comprehensive token holder distribution analysis with sniper and bundler detection.

```typescript
const holders = await client.holderAnalysis.get('token_address', {
  chain: 'sol',
});

// First buyers analysis
const fba = holders.first_buyers_analysis;
console.log(`Initially acquired: ${fba.initially_acquired_percentage}%`);
console.log(`Top 10 buyers bought: ${fba.top_10_buyers_bought_percentage}%`);
console.log(`Bundled buyers: ${fba.bundled_buyers_count}`);
console.log(`Still holding: ${fba.buyers_still_holding_count}`);

// Sniper analysis
const sa = holders.sniper_analysis;
console.log(`Sniper count: ${sa?.sniper_count}`);
console.log(`Sniper percentage: ${sa?.sniper_total_percentage}%`);
console.log(`Confidence score: ${sa?.sniper_confidence_score}/100`);

// Top holders
const top10 = holders.top_10_holders_analysis;
console.log(`Top 10 hold: ${top10?.percentageHeldByTop10}%`);
```

### Trading Lite (Solana)

Simplified trading analysis optimized for Solana tokens.

```typescript
const analysis = await client.tradingLite.analyze('pump_token_address');

console.log(`Sniper % on Launch: ${analysis.SniperPercentageOnLaunch}%`);
console.log(`Bundler % on Launch: ${analysis.BundlerPercentageOnLaunch}%`);
console.log(`Sniper % Holding: ${analysis.SniperPercentageHolding}%`);
console.log(`Bundler % Holding: ${analysis.BundlerPercentageHolding}%`);
console.log(`Dev Holding: ${analysis.DevHoldingPercentage}%`);
console.log(`Top 10 Holding: ${analysis.Top10HoldingPercentage}%`);
```

### Trending Tokens

Discover trending tokens with risk data.

```typescript
const trending = await client.tokens.getTrending({ chain: 'sol' });

for (const token of trending.tokens) {
  console.log(`${token.name} (${token.symbol})`);
  console.log(`  Price: $${token.price}`);
  console.log(`  Volume: $${token.volume_24h}`);
}
```

### Token Pools

Get liquidity pool data for tokens.

```typescript
const pools = await client.tokens.getPools('token_address', { chain: 'sol' });

for (const pool of pools.pools) {
  console.log(`${pool.name} on ${pool.dex}`);
  console.log(`  Liquidity: $${pool.liquidity}`);
}

// Get trending pools
const trendingPools = await client.tokens.getTrendingPools({ chain: 'sol' });
```

## API Reference

### TradingClient

```typescript
const client = new TradingClient({
  apiKey: string;           // Required: Your Webacy API key
  baseUrl?: string;         // Optional: Custom API URL
  timeout?: number;         // Optional: Request timeout (ms)
  retry?: RetryConfig;      // Optional: Retry configuration
});
```

### Resources

| Resource | Method | Description |
|----------|--------|-------------|
| `holderAnalysis` | `get(address, options)` | Get holder distribution analysis |
| `tradingLite` | `analyze(address, options?)` | Get simplified trading analysis |
| `tokens` | `getTrending(options)` | Get trending tokens |
| `tokens` | `getPools(address, options)` | Get liquidity pools for token |
| `tokens` | `getTrendingPools(options)` | Get trending liquidity pools |

## Supported Chains

- Solana (`sol`) - Full support including Trading Lite
- Ethereum (`eth`) - Holder analysis
- Base (`base`) - Holder analysis
- BSC (`bsc`) - Holder analysis
- Polygon (`pol`) - Holder analysis
- Arbitrum (`arb`) - Holder analysis
- Optimism (`opt`) - Holder analysis

## Error Handling

```typescript
import { TradingClient, RateLimitError, NotFoundError } from '@webacy-xyz/sdk-trading';

try {
  const holders = await client.holderAnalysis.get('token', { chain: 'sol' });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof NotFoundError) {
    console.log('Token not found');
  }
}
```

## License

MIT
