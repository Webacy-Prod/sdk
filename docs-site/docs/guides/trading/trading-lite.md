---
sidebar_position: 2
---

# Trading Lite

Simplified, fast token analysis optimized for trading decisions.

## Overview

Trading Lite provides a quick, streamlined analysis focusing on the most critical metrics for trading decisions:

- Sniper and bundler percentages
- Top holder concentration
- Developer activity (holdings, recent launches)
- Token permissions (mintable, freezable)
- DexScreener paid status

**Currently supports Solana only.**

## Basic Usage

```typescript
import { TradingClient } from '@webacy-xyz/sdk-trading';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const analysis = await client.tradingLite.analyze('pump_token_address');
```

## Response Structure

```typescript
interface AddressHolding {
  address: string;
  initiallyAcquiredPercentage: number;
  initiallyAcquiredAmount: number;
  currentHoldingPercentage: number;
  currentHoldingAmount: number;
}

interface TradingLiteAnalysis {
  // Token & Developer addresses
  CA: string;                      // Contract/Token Address (mint)
  DA: string;                      // Deployer Address (developer)

  // Sniper metrics
  SniperPercentageOnLaunch: number;
  SniperPercentageHolding: number;
  SniperAddresses: AddressHolding[];
  SniperConfidence: number | null; // Confidence score (0-100)

  // Bundler metrics
  BundlerPercentageOnLaunch: number;
  BundlerPercentageHolding: number;
  BundlerAddresses: AddressHolding[];

  // Holder metrics
  Top10Holders: number;            // Percentage held by top 10
  TotalHolders: number;            // Total unique holders

  // Developer activity
  DevHoldingPercentage: number;
  DevLaunched24Hours: number;

  // Token permissions
  mintable: boolean;
  freezable: boolean;

  // Promotion status
  DexScreenerPaid: boolean;

  // Analysis metadata
  lastAnalyzedSlot?: number;
  analysisTimestamp?: number;
}
```

## Quick Safety Check

```typescript
function isSafeToTrade(analysis: TradingLiteAnalysis): boolean {
  // High sniper activity is risky
  if (analysis.SniperPercentageOnLaunch > 20) {
    console.warn('High sniper activity on launch');
    return false;
  }

  // High bundler activity indicates coordination
  if (analysis.BundlerPercentageOnLaunch > 30) {
    console.warn('High coordinated buying detected');
    return false;
  }

  // Dev launched too many tokens recently (possible serial rugger)
  if (analysis.DevLaunched24Hours > 5) {
    console.warn('Developer has launched many tokens recently');
    return false;
  }

  // Mintable tokens can have supply increased
  if (analysis.mintable) {
    console.warn('Token supply can be increased by owner');
    return false;
  }

  // Freezable tokens can have wallets frozen
  if (analysis.freezable) {
    console.warn('Token accounts can be frozen by owner');
    return false;
  }

  return true;
}
```

## Risk Scoring Example

```typescript
function calculateRiskScore(analysis: TradingLiteAnalysis): number {
  let score = 0;

  // Sniper risk (0-25 points)
  score += Math.min(analysis.SniperPercentageOnLaunch, 25);

  // Bundler risk (0-25 points)
  score += Math.min(analysis.BundlerPercentageOnLaunch, 25);

  // Concentration risk (0-20 points)
  if (analysis.Top10Holders > 50) {
    score += (analysis.Top10Holders - 50) * 0.4;
  }

  // Dev risk (0-15 points)
  score += analysis.DevLaunched24Hours * 3;

  // Permission risk (0-15 points)
  if (analysis.mintable) score += 10;
  if (analysis.freezable) score += 5;

  return Math.min(score, 100);
}
```

## Performance

Trading Lite is optimized for speed:

| Metric | First Call | Cached Call |
|--------|------------|-------------|
| Response Time | ~500ms | ~50ms |
| Data Freshness | Real-time | Up to 1 hour |

First calls run full analysis and persist data. Subsequent calls return cached static data with real-time holdings updates.

## Comparison with Holder Analysis

| Feature | Trading Lite | Holder Analysis |
|---------|-------------|-----------------|
| Response Time | Faster | Slower |
| Detail Level | Summary | Comprehensive |
| Sniper Addresses | ✅ | ✅ |
| Bundled Addresses | ✅ | ✅ |
| Time Analysis | ❌ | ✅ |
| Use Case | Quick checks | Deep analysis |

Use Trading Lite for:
- Trading bots needing fast decisions
- Initial token screening
- High-volume scanning

Use Holder Analysis for:
- Detailed investigation
- Identifying specific wallets
- Research and reporting
