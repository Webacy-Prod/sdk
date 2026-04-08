---
sidebar_position: 2
---

# Sanctions Screening

OFAC and global sanctions compliance checking.

## Overview

The Sanctions endpoint provides real-time screening against:
- OFAC (U.S. Treasury) sanctions list
- International sanctions databases
- Known sanctioned entities and their associated wallets

## Basic Usage

```typescript
import { ThreatClient } from '@webacy-xyz/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const result = await client.addresses.checkSanctioned(
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  { chain: 'eth' }
);

if (result.is_sanctioned) {
  console.log('Address is SANCTIONED - do not interact!');
}
```

## Response Structure

```typescript
interface SanctionedCheckResponse {
  address: string;
  chain: string;
  is_sanctioned: boolean;
  sanction_details?: {
    list: string;           // e.g., "OFAC SDN"
    date_added: string;     // ISO date
    entity_name?: string;   // If known
    program?: string;       // e.g., "CYBER2"
  };
}
```

## Compliance Flow

### Pre-Transaction Check

```typescript
async function checkCompliance(address: string): Promise<void> {
  const result = await client.addresses.checkSanctioned(address, {
    chain: 'eth',
  });

  if (result.is_sanctioned) {
    // Log for compliance records
    console.error(`Blocked sanctioned address: ${address}`);
    console.error(`List: ${result.sanction_details?.list}`);
    console.error(`Added: ${result.sanction_details?.date_added}`);

    throw new Error('Transaction blocked: sanctioned address');
  }
}
```

### Batch Screening

```typescript
async function screenAddresses(addresses: string[]): Promise<{
  clean: string[];
  sanctioned: string[];
}> {
  const clean: string[] = [];
  const sanctioned: string[] = [];

  for (const address of addresses) {
    const result = await client.addresses.checkSanctioned(address, {
      chain: 'eth',
    });

    if (result.is_sanctioned) {
      sanctioned.push(address);
    } else {
      clean.push(address);
    }
  }

  return { clean, sanctioned };
}
```

## Important Considerations

### Regulatory Compliance

:::warning
Interacting with sanctioned addresses may violate laws in many jurisdictions. Always check local regulations.
:::

### False Positives

Not all flagged addresses are directly sanctioned. Some may be:
- Associated with sanctioned entities
- One hop away from sanctioned addresses
- Flagged by third-party databases

Always verify with official OFAC lists for legal certainty.

### Caching

Sanctions data is updated in real-time from source databases. Results are cached for 24 hours unless:
- New sanctions are added
- Sanctions are removed
- Address status changes

## Known Sanctioned Entities

Some commonly blocked addresses:
- Tornado Cash contracts
- Lazarus Group wallets
- Various ransomware operators

The SDK automatically checks against all known sanctioned addresses and their associated wallets.

## Combining with Address Risk

For comprehensive compliance:

```typescript
async function fullComplianceCheck(address: string): Promise<boolean> {
  // Quick sanctions check
  const sanctions = await client.addresses.checkSanctioned(address, {
    chain: 'eth',
  });

  if (sanctions.is_sanctioned) {
    return false;
  }

  // Full risk analysis
  const risk = await client.addresses.analyze(address, {
    chain: 'eth',
  });

  // Check for indirect sanctions exposure
  if (risk.details?.fund_flows?.risk?.ofac) {
    console.warn('Address has indirect OFAC exposure');
    return false;
  }

  return risk.overallRisk < 50;
}
```
