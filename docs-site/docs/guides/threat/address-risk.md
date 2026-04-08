---
sidebar_position: 1
---

# Address Risk Analysis

Comprehensive risk scoring for blockchain addresses.

## Overview

The Address Risk endpoint analyzes any blockchain address for:
- Overall risk score
- Fund flow analysis
- Sanctions exposure
- Known labels (exchange, hacker, mixer, etc.)
- Token holdings risk
- Transaction patterns

## Basic Usage

```typescript
import { ThreatClient } from '@webacy-xyz/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const risk = await client.addresses.analyze(
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  { chain: 'eth' }
);
```

## Response Structure

```typescript
interface AddressRiskResponse {
  // Risk scores (0-100)
  overallRisk: number;
  high: number;      // High severity issues
  medium: number;    // Medium severity issues
  count: number;     // Total issues

  // Address metadata
  isContract: boolean;
  addressType: 'EOA' | 'CONTRACT' | 'TOKEN';
  expiresAt: number;

  // Detailed analysis
  details?: {
    fund_flows?: {
      label: string;
      risk: {
        ofac: boolean;
        hacker: boolean;
        mixers: boolean;
        drainer: boolean;
        tornado: boolean;
      };
      accounts: Record<string, AccountInfo>;
    };
    token_risk?: Record<string, TokenRisk>;
    address_info?: {
      balance: number;
      risk_level: 'low' | 'medium' | 'high';
      ofac_sanctioned: boolean;
      transaction_count: number;
    };
  };

  // Issues found
  issues?: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
}
```

## Understanding Risk Scores

### Overall Risk

| Score | Level | Description |
|-------|-------|-------------|
| 0-20 | Low | Safe, no significant issues |
| 21-50 | Medium | Some concerns, proceed with caution |
| 51-80 | High | Significant risk, not recommended |
| 81-100 | Critical | Known bad actor or sanctioned |

### Fund Flow Risk Flags

```typescript
// Check for dangerous fund flow connections
if (risk.details?.fund_flows?.risk) {
  const { ofac, hacker, mixers, drainer, tornado } = risk.details.fund_flows.risk;

  if (ofac) console.warn('Connected to OFAC sanctioned address');
  if (hacker) console.warn('Connected to known hacker');
  if (mixers) console.warn('Connected to mixing services');
  if (drainer) console.warn('Connected to wallet drainer');
  if (tornado) console.warn('Connected to Tornado Cash');
}
```

## Risk Modules

Request specific analysis modules:

```typescript
import { RiskModule } from '@webacy-xyz/sdk';

const risk = await client.addresses.analyze('0x...', {
  chain: 'eth',
  modules: [
    RiskModule.FUND_FLOW_SCREENING,
    RiskModule.SANCTIONS_COMPLIANCE,
    RiskModule.TOKEN_RISK,
  ],
});
```

Available modules:
- `FUND_FLOW_SCREENING` - Transaction graph analysis
- `SANCTIONS_COMPLIANCE` - OFAC/sanctions check
- `TOKEN_RISK` - Token holdings analysis
- `CONTRACT_ANALYSIS` - Smart contract review
- `TRANSACTION_RISK` - Recent transaction patterns

## Common Use Cases

### Wallet Screening

```typescript
async function screenWallet(address: string): Promise<boolean> {
  const risk = await client.addresses.analyze(address, { chain: 'eth' });

  // Block high-risk wallets
  if (risk.overallRisk > 70) {
    console.log(`Blocked: Risk score ${risk.overallRisk}`);
    return false;
  }

  // Block sanctioned wallets
  if (risk.details?.address_info?.ofac_sanctioned) {
    console.log('Blocked: OFAC sanctioned');
    return false;
  }

  return true;
}
```

### Pre-Transaction Check

```typescript
async function checkBeforeTransfer(to: string): Promise<void> {
  const risk = await client.addresses.analyze(to, { chain: 'eth' });

  if (risk.overallRisk > 50) {
    throw new Error(`Recipient has elevated risk: ${risk.overallRisk}`);
  }

  if (risk.details?.fund_flows?.risk?.drainer) {
    throw new Error('Recipient connected to known drainer');
  }
}
```

## Supported Chains

| Chain | Code | Full Support |
|-------|------|--------------|
| Ethereum | `eth` | ✅ |
| Solana | `sol` | ✅ |
| BSC | `bsc` | ✅ |
| Polygon | `pol` | ✅ |
| Arbitrum | `arb` | ✅ |
| Optimism | `opt` | ✅ |
| Base | `base` | ✅ |
| Bitcoin | `btc` | Partial |
| TON | `ton` | Partial |
