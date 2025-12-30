# @webacy/sdk-core

Core utilities and shared internals for Webacy SDK packages. This package is automatically installed as a dependency of `@webacy/sdk-trading` and `@webacy/sdk-threat`.

## Installation

This package is typically not installed directly. Instead, install one of the SDK packages:

```bash
npm install @webacy/sdk           # Full SDK
npm install @webacy/sdk-trading   # Trading analysis only
npm install @webacy/sdk-threat    # Threat analysis only
```

## What's Included

### Chain Support

```typescript
import { Chain, isEvmChain, CHAIN_IDS, CHAIN_NAMES } from '@webacy/sdk-core';

// Check if a chain is EVM-compatible
if (isEvmChain(Chain.ETH)) {
  console.log('Using EVM chain');
}

// Get chain metadata
console.log(CHAIN_NAMES[Chain.SOL]); // "Solana"
console.log(CHAIN_IDS[Chain.ETH]);   // 1
```

### Error Classes

```typescript
import {
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '@webacy/sdk-core';

try {
  await client.addresses.analyze('0x...');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Retry after ${error.retryAfter} seconds`);
  }
}
```

### Type Definitions

```typescript
import type {
  RiskTag,
  RiskModule,
  RiskCategory,
  TokenMetadata,
  OwnershipDistribution,
} from '@webacy/sdk-core';
```

### Address Validation

```typescript
import {
  isValidAddress,
  isValidEvmAddress,
  isValidSolanaAddress,
} from '@webacy/sdk-core';

isValidAddress('0x742d35Cc...', Chain.ETH); // true
isValidSolanaAddress('EPjFWdd5Aufq...'); // true
```

## Supported Chains

| Chain | Code | EVM |
|-------|------|-----|
| Ethereum | `eth` | Yes |
| Base | `base` | Yes |
| BSC | `bsc` | Yes |
| Polygon | `pol` | Yes |
| Arbitrum | `arb` | Yes |
| Optimism | `opt` | Yes |
| Solana | `sol` | No |
| TON | `ton` | No |
| Sui | `sui` | No |
| Stellar | `stellar` | No |
| Bitcoin | `btc` | No |

## License

MIT
