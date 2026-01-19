---
sidebar_position: 3
---

# Contract Analysis

Smart contract security and vulnerability detection.

## Overview

The Contract Analysis endpoint examines smart contracts for:
- Security vulnerabilities
- Honeypot patterns
- Rugpull mechanisms
- Buy/sell tax configurations
- Ownership and permissions

## Basic Usage

```typescript
import { ThreatClient } from '@webacy/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

const contract = await client.contracts.analyze(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',  // USDT
  { chain: 'eth' }
);
```

## Response Structure

```typescript
interface ContractRiskResponse {
  address: string;
  chain: string;
  name?: string;
  symbol?: string;
  verified: boolean;

  // Risk indicators
  is_honeypot: boolean;
  has_proxy: boolean;
  is_mintable: boolean;
  can_take_ownership: boolean;
  hidden_owner: boolean;
  selfdestruct: boolean;

  // Tax analysis
  buy_tax?: number;
  sell_tax?: number;
  transfer_tax?: number;

  // Issues found
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
  }>;
}
```

## Honeypot Detection

Honeypots are tokens designed to prevent selling:

```typescript
const contract = await client.contracts.analyze(tokenAddress, {
  chain: 'eth',
});

if (contract.is_honeypot) {
  console.error('WARNING: This token is a honeypot!');
  console.error('You will not be able to sell.');
  return;
}

// Check for high sell tax (soft honeypot)
if (contract.sell_tax && contract.sell_tax > 50) {
  console.warn(`High sell tax: ${contract.sell_tax}%`);
}
```

## Tax Analysis

```typescript
async function checkTaxes(tokenAddress: string): Promise<void> {
  const contract = await client.contracts.analyze(tokenAddress, {
    chain: 'eth',
  });

  console.log(`Buy Tax: ${contract.buy_tax ?? 0}%`);
  console.log(`Sell Tax: ${contract.sell_tax ?? 0}%`);

  // Calculate round-trip cost
  const buyTax = contract.buy_tax ?? 0;
  const sellTax = contract.sell_tax ?? 0;
  const roundTrip = 100 - (100 - buyTax) * (100 - sellTax) / 100;

  console.log(`Round-trip tax: ${roundTrip.toFixed(2)}%`);

  if (roundTrip > 10) {
    console.warn('High round-trip tax - significant loss on trades');
  }
}
```

## Dangerous Permissions

### Mintable Tokens

```typescript
if (contract.is_mintable) {
  console.warn('Token supply can be increased');
  // Owner can dilute your holdings
}
```

### Ownership Risks

```typescript
if (contract.hidden_owner) {
  console.warn('Contract has hidden owner functionality');
  // Owner may have hidden privileges
}

if (contract.can_take_ownership) {
  console.warn('Ownership can be transferred without notice');
}
```

### Self-Destruct

```typescript
if (contract.selfdestruct) {
  console.error('Contract can self-destruct!');
  // Funds may be unrecoverable
}
```

## Complete Safety Check

```typescript
async function isContractSafe(address: string): Promise<boolean> {
  const contract = await client.contracts.analyze(address, {
    chain: 'eth',
  });

  // Immediate deal-breakers
  if (contract.is_honeypot) {
    console.log('Blocked: Honeypot detected');
    return false;
  }

  if (contract.selfdestruct) {
    console.log('Blocked: Self-destruct capability');
    return false;
  }

  if (!contract.verified) {
    console.log('Warning: Unverified contract');
    // May still be safe, but proceed with caution
  }

  // Tax check
  const maxTax = Math.max(
    contract.buy_tax ?? 0,
    contract.sell_tax ?? 0
  );

  if (maxTax > 20) {
    console.log(`Blocked: High tax (${maxTax}%)`);
    return false;
  }

  // Critical issues
  const criticalIssues = contract.issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    console.log(`Blocked: ${criticalIssues.length} critical issues`);
    return false;
  }

  return true;
}
```

## Source Code Analysis

Get verified source code:

```typescript
const source = await client.contracts.getSourceCode(contractAddress, {
  chain: 'eth',
});

if (source.verified) {
  console.log(`Contract Name: ${source.contract_name}`);
  console.log(`Compiler: ${source.compiler_version}`);
  // source.source_code contains the actual code
}
```

## Supported Chains

| Chain | Honeypot Detection | Tax Analysis | Source Code |
|-------|-------------------|--------------|-------------|
| Ethereum | ✅ | ✅ | ✅ |
| BSC | ✅ | ✅ | ✅ |
| Polygon | ✅ | ✅ | ✅ |
| Arbitrum | ✅ | ✅ | ✅ |
| Optimism | ✅ | ✅ | ✅ |
| Base | ✅ | ✅ | ✅ |
