---
sidebar_position: 1
---

# Holder Analysis

Comprehensive token holder distribution analysis with sniper and bundler detection.

## Overview

The Holder Analysis endpoint provides deep insights into:
- Token holder distribution
- Top holder concentration
- First buyers analysis
- Sniper detection with confidence scoring
- Bundler (coordinated buying) detection
- Developer wallet tracking

## Basic Usage

```typescript
import { TradingClient } from '@webacy/sdk-trading';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const analysis = await client.holderAnalysis.get(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  { chain: 'sol' }
);
```

## Response Structure

```typescript
interface HolderAnalysisResult {
  token_address: string;

  // Token metadata
  metadata?: {
    name: string;
    symbol: string;
    current_price: number;
    market_cap: number;
  };

  // First buyers analysis
  first_buyers_analysis: {
    initially_acquired_percentage: number;
    buyers_analyzed_count: number;
    top_5_buyers_bought_percentage: number;
    top_10_buyers_bought_percentage: number;
    top_20_buyers_bought_percentage: number;
    current_holding_percentage: number;
    buyers_still_holding_count: number;
    bundled_buyers_count: number;
    bundled_buyers_still_holding_count: number;
    all_bundled_addresses: string[];
  };

  // Top holders
  top_10_holders_analysis: {
    totalSupply: string;
    percentageHeldByTop10: number;
    topHolders: Array<{
      ownerAddress: string;
      amount: string;
      percentage: number;
    }>;
  };

  // Sniper detection
  sniper_analysis: {
    sniper_count: number;
    sniper_addresses: string[];
    sniper_total_percentage: number;
    sniper_confidence_score: number | null;
    potential_frontrunning_detected: boolean;
    average_time_since_mint: number;
    median_time_since_mint: number;
  };
}
```

## Understanding Sniper Detection

Snipers are wallets that buy tokens extremely quickly after launch, often within seconds. This can indicate:
- Bot activity
- Insider trading
- Front-running

### Confidence Score

The `sniper_confidence_score` ranges from 0-100:
- **80-100**: High confidence - clear sniper activity
- **50-79**: Medium confidence - possible sniper behavior
- **0-49**: Low confidence - likely normal buying

### Detection Criteria

```typescript
// Check for high sniper activity
if (analysis.sniper_analysis.sniper_count > 0) {
  console.log(`Found ${analysis.sniper_analysis.sniper_count} snipers`);
  console.log(`Holding ${analysis.sniper_analysis.sniper_total_percentage}% of supply`);

  if (analysis.sniper_analysis.sniper_confidence_score > 80) {
    console.warn('High confidence sniper activity detected!');
  }
}
```

## Understanding Bundler Detection

Bundlers are groups of wallets that buy together in coordinated transactions. This often indicates:
- Team wallets hiding ownership
- Wash trading
- Coordinated pump schemes

### Example

```typescript
const bundled = analysis.first_buyers_analysis;

if (bundled.bundled_buyers_count > 0) {
  console.log(`Found ${bundled.bundled_buyers_count} bundled buyers`);
  console.log(`Still holding: ${bundled.bundled_buyers_still_holding_count}`);
  console.log(`All bundled addresses:`, bundled.all_bundled_addresses);
}
```

## Red Flags to Watch For

```typescript
function analyzeRisk(analysis: HolderAnalysisResult): string[] {
  const redFlags: string[] = [];

  // High top holder concentration
  if (analysis.top_10_holders_analysis.percentageHeldByTop10 > 80) {
    redFlags.push('Top 10 holders own over 80% of supply');
  }

  // Significant sniper activity
  if (analysis.sniper_analysis.sniper_total_percentage > 20) {
    redFlags.push('Snipers hold over 20% of supply');
  }

  // Many bundled buyers
  if (analysis.first_buyers_analysis.bundled_buyers_count > 10) {
    redFlags.push('High number of coordinated buyers');
  }

  // Front-running detected
  if (analysis.sniper_analysis.potential_frontrunning_detected) {
    redFlags.push('Potential front-running activity detected');
  }

  return redFlags;
}
```

## Supported Chains

| Chain | Code | Notes |
|-------|------|-------|
| Solana | `sol` | Full support with sniper detection |
| Ethereum | `eth` | Full support |
| BSC | `bsc` | Full support |
| Base | `base` | Full support |
| Polygon | `pol` | Full support |
| Arbitrum | `arb` | Full support |
| Optimism | `opt` | Full support |
| Stellar | `stellar` | Use CODE:ISSUER format |

## Caching

Results are cached for 1 hour. To force a fresh fetch:

```typescript
const fresh = await client.holderAnalysis.get(tokenAddress, {
  chain: 'sol',
  disableRefetch: false,  // Force fresh data
});
```
