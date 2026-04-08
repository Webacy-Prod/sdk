# Default Chain Configuration

Configure a default blockchain to reduce boilerplate when working primarily with one chain.

## Basic Usage

Set `defaultChain` when creating your client:

```typescript
import { ThreatClient, Chain } from '@webacy-xyz/sdk';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.ETH,
});

// No need to specify chain - uses ETH by default
const risk = await client.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
const sanctioned = await client.addresses.checkSanctioned('0x742d35Cc...');
const contract = await client.contracts.analyze('0xdAC17F958D2ee523a2206206994597C13D831ec7');
```

## Overriding the Default

You can always override the default for specific calls:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.ETH,
});

// Uses ETH (default)
const ethRisk = await client.addresses.analyze('0x742d35Cc...');

// Override to use Solana
const solRisk = await client.addresses.analyze('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', {
  chain: Chain.SOL,
});

// Override to use BSC
const bscRisk = await client.addresses.analyze('0x742d35Cc...', {
  chain: Chain.BSC,
});
```

## Supported Chains

All chains in the `Chain` enum can be used as defaults:

```typescript
import { Chain } from '@webacy-xyz/sdk';

// EVM Chains
Chain.ETH    // Ethereum
Chain.BSC    // BNB Smart Chain
Chain.POL    // Polygon
Chain.ARB    // Arbitrum
Chain.OPT    // Optimism
Chain.BASE   // Base

// Non-EVM Chains
Chain.SOL    // Solana
Chain.BTC    // Bitcoin
Chain.TON    // TON
Chain.SUI    // Sui
Chain.STELLAR // Stellar
Chain.SEI    // Sei
```

## Error Handling

If you don't set a default and forget to specify chain, you'll get a clear error:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  // No defaultChain set
});

try {
  // This will throw ValidationError
  await client.addresses.analyze('0x742d35Cc...');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message);
    // "Chain is required. Either specify chain in options or set defaultChain in client configuration."
  }
}
```

## Trading Client

Works the same way with `TradingClient`:

```typescript
import { TradingClient, Chain } from '@webacy-xyz/sdk';

const client = new TradingClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.SOL,
});

// Uses Solana by default
const holders = await client.holderAnalysis.get('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const pools = await client.tokens.getPools('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const trending = await client.tokens.getTrending();
```

## Unified SDK

The unified `WebacyClient` also supports default chain:

```typescript
import { WebacyClient, Chain } from '@webacy-xyz/sdk';

const client = new WebacyClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.ETH,
});

// Both threat and trading methods use the default
const risk = await client.threat.addresses.analyze('0x...');
const holders = await client.trading.holderAnalysis.get('0x...', {
  chain: Chain.ETH, // Can still specify explicitly
});
```

## Use Cases

### Single-Chain Application

If your app only works with one blockchain:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.SOL,
});

// All calls use Solana - clean and simple
async function analyzeToken(mint: string) {
  const risk = await client.addresses.analyze(mint);
  return risk;
}
```

### Multi-Chain with Primary

If you work mostly with one chain but occasionally others:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: Chain.ETH, // Primary chain
});

async function analyzeAddress(address: string, chain?: Chain) {
  // Uses ETH by default, or the specified chain
  return await client.addresses.analyze(address, chain ? { chain } : {});
}
```

### Environment-Based Default

Set default chain from environment:

```typescript
import { ThreatClient, Chain } from '@webacy-xyz/sdk';

const chainMap: Record<string, Chain> = {
  'ethereum': Chain.ETH,
  'solana': Chain.SOL,
  'bsc': Chain.BSC,
};

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  defaultChain: chainMap[process.env.DEFAULT_CHAIN ?? 'ethereum'],
});
```

## Best Practices

1. **Set a default when working primarily with one chain** - Reduces boilerplate
2. **Always be explicit in multi-chain apps** - Avoid confusion about which chain is being used
3. **Use environment variables for flexibility** - Easy to change defaults per environment
4. **Document your default** - Make it clear which chain is the default in your app
