# @webacy-xyz/sdk-threat

Threat and risk analysis SDK for the Webacy Risk Score API. Analyze addresses, contracts, and URLs for security risks.

## Installation

```bash
npm install @webacy-xyz/sdk-threat
```

Or install the full SDK:

```bash
npm install @webacy-xyz/sdk
```

## Quick Start

```typescript
import { ThreatClient, RiskModule } from '@webacy-xyz/sdk-threat';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Analyze address risk
const risk = await client.addresses.analyze('0x742d35Cc...', {
  chain: 'eth',
});

console.log(`Risk Score: ${risk.overallRisk}/100`);
console.log(`High severity issues: ${risk.high}`);
```

## Features

### Address Risk Analysis

Comprehensive security analysis for blockchain addresses.

```typescript
const risk = await client.addresses.analyze('0x742d35Cc...', {
  chain: 'eth',
  modules: [RiskModule.FUND_FLOW_SCREENING, RiskModule.SANCTIONS_COMPLIANCE],
  detailed: true,
});

console.log(`Overall Risk: ${risk.overallRisk}/100`);
console.log(`Is Contract: ${risk.isContract}`);
console.log(`Address Type: ${risk.addressType}`);
console.log(`High Issues: ${risk.high}`);
console.log(`Medium Issues: ${risk.medium}`);

// Detailed fund flow analysis
if (risk.details?.fund_flows?.risk) {
  const flowRisk = risk.details.fund_flows.risk;
  if (flowRisk.ofac) console.log('Connected to OFAC addresses');
  if (flowRisk.tornado) console.log('Used Tornado Cash');
  if (flowRisk.mixers) console.log('Used mixing services');
}
```

### Sanctions Screening

Screen addresses against OFAC and other sanctions lists.

```typescript
const result = await client.addresses.checkSanctioned('0x...', {
  chain: 'eth',
});

if (result.is_sanctioned) {
  console.log('Address is sanctioned!');
  console.log(`Source: ${result.sanction_details?.source}`);
  console.log(`List: ${result.sanction_details?.list_name}`);
}
```

### Address Poisoning Detection

Detect dust attack and address poisoning attempts.

```typescript
const result = await client.addresses.checkPoisoning('0x...', {
  chain: 'eth',
});

if (result.is_poisoned) {
  console.log('Poisoning detected!');
  console.log(`Similar addresses: ${result.poisoning_details?.similar_addresses?.length}`);
  console.log(`Dust transactions: ${result.poisoning_details?.dust_tx_count}`);
}
```

### Contract Analysis

Analyze smart contracts for vulnerabilities.

```typescript
const contract = await client.contracts.analyze('0xContract...', {
  chain: 'eth',
});

console.log(`Risk Score: ${contract.overallRisk}/100`);
console.log(`Verified: ${contract.is_verified}`);

// Vulnerabilities
for (const vuln of contract.vulnerabilities || []) {
  console.log(`${vuln.severity}: ${vuln.name}`);
}

// Get source code
const source = await client.contracts.getSourceCode('0xContract...', {
  chain: 'eth',
});

// Get buy/sell taxes
const taxes = await client.contracts.getTaxes('0xToken...', {
  chain: 'eth',
});
console.log(`Buy Tax: ${taxes.buy_tax}%`);
console.log(`Sell Tax: ${taxes.sell_tax}%`);
```

### URL Safety

Check URLs for phishing and malware.

```typescript
const result = await client.url.check('https://suspicious-site.com');

if (result.is_malicious) {
  console.log(`Risk Score: ${result.risk_score}/100`);
  console.log(`Threats: ${result.threat_types?.join(', ')}`);
}

// Report a malicious URL
await client.url.add('https://phishing-site.xyz');
```

### Wallet Analysis

Analyze wallet transactions and token approvals.

```typescript
// Get recent transactions
const txs = await client.wallets.getTransactions('0x...', {
  chain: 'eth',
  limit: 10,
});

// Get token approvals
const approvals = await client.wallets.getApprovals('0x...', {
  chain: 'eth',
});

for (const approval of approvals.approvals || []) {
  console.log(`${approval.token_symbol}: ${approval.amount}`);
  if (approval.risk_score > 70) {
    console.log('  ⚠️ High risk approval!');
  }
}
```

### Ledger Scan

Scan hardware wallet transactions for security.

```typescript
const scan = await client.ledger.scanTransaction('ethereum', {
  tx: {
    from: '0x...',
    to: '0x...',
    data: '0x...',
  },
  chain: 1,
});

console.log(`Risk Level: ${scan.risk_level}`);
for (const warning of scan.warnings || []) {
  console.log(`Warning: ${warning}`);
}
```

### Account Trace

Trace fund flows for an address.

```typescript
const trace = await client.accountTrace.trace('0x...', {
  chain: 'eth',
});

console.log(`Traced transactions: ${trace.transactions?.length}`);
```

### API Usage

Monitor your API usage and quota.

```typescript
const usage = await client.usage.getCurrent();
console.log(`Requests used: ${usage.requests_used}`);
console.log(`Requests limit: ${usage.requests_limit}`);
```

## API Reference

### ThreatClient

```typescript
const client = new ThreatClient({
  apiKey: string;           // Required: Your Webacy API key
  baseUrl?: string;         // Optional: Custom API URL
  timeout?: number;         // Optional: Request timeout (ms)
  retry?: RetryConfig;      // Optional: Retry configuration
});
```

### Resources

| Resource | Method | Description |
|----------|--------|-------------|
| `addresses` | `analyze(address, options)` | Analyze address risk |
| `addresses` | `checkSanctioned(address, options)` | Check sanctions status |
| `addresses` | `checkPoisoning(address, options)` | Check for poisoning |
| `contracts` | `analyze(address, options)` | Analyze contract risk |
| `contracts` | `getSourceCode(address, options)` | Get contract source |
| `contracts` | `getTaxes(address, options)` | Get token taxes |
| `contracts` | `analyzeSolidity(body)` | Analyze Solidity code |
| `url` | `check(url)` | Check URL safety |
| `url` | `add(url)` | Report malicious URL |
| `wallets` | `getTransactions(address, options)` | Get wallet transactions |
| `wallets` | `getApprovals(address, options)` | Get token approvals |
| `ledger` | `scanTransaction(family, body)` | Scan Ledger transaction |
| `ledger` | `scanEip712(family, body)` | Scan EIP-712 message |
| `accountTrace` | `trace(address, options)` | Trace fund flows |
| `usage` | `getUsage(options)` | Get usage history |
| `usage` | `getCurrent()` | Get current usage |
| `usage` | `getPlans()` | Get available plans |

## Risk Modules

```typescript
import { RiskModule } from '@webacy-xyz/sdk-threat';

const modules = [
  RiskModule.FUND_FLOW_SCREENING,
  RiskModule.SANCTIONS_COMPLIANCE,
  RiskModule.CONTRACT_ANALYSIS,
  RiskModule.TOKEN_SECURITY,
  // ... and more
];
```

## Supported Chains

- Ethereum (`eth`)
- Base (`base`)
- BSC (`bsc`)
- Polygon (`pol`)
- Arbitrum (`arb`)
- Optimism (`opt`)
- Solana (`sol`)
- TON (`ton`)
- Sui (`sui`)
- Stellar (`stellar`)
- Bitcoin (`btc`)

## Error Handling

```typescript
import { ThreatClient, RateLimitError, AuthenticationError } from '@webacy-xyz/sdk-threat';

try {
  const risk = await client.addresses.analyze('0x...', { chain: 'eth' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`);
  }
}
```

## License

MIT
