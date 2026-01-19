---
sidebar_position: 1
---

# Installation

Choose the package that fits your needs.

## Full SDK (Recommended)

Install the complete SDK with both trading and threat analysis:

```bash
npm install @webacy/sdk
```

This includes:
- `@webacy/sdk-trading` - Token trading analysis
- `@webacy/sdk-threat` - Threat and risk analysis
- `@webacy/sdk-core` - Shared utilities (auto-installed)

## Individual Packages

If you only need specific functionality:

### Trading Analysis Only

```bash
npm install @webacy/sdk-trading
```

Best for:
- Token holder analysis
- Sniper/bundler detection
- Trading bots and memecoin scanners

### Threat Analysis Only

```bash
npm install @webacy/sdk-threat
```

Best for:
- Wallet security
- Address risk scoring
- Sanctions compliance
- Contract auditing

## Package Comparison

| Feature | `@webacy/sdk` | `@webacy/sdk-trading` | `@webacy/sdk-threat` |
|---------|---------------|----------------------|---------------------|
| Holder Analysis | ✅ | ✅ | ❌ |
| Sniper Detection | ✅ | ✅ | ❌ |
| Trading Lite | ✅ | ✅ | ❌ |
| Token Pools | ✅ | ✅ | ❌ |
| Address Risk | ✅ | ❌ | ✅ |
| Sanctions | ✅ | ❌ | ✅ |
| Contract Analysis | ✅ | ❌ | ✅ |
| URL Safety | ✅ | ❌ | ✅ |
| Wallet Analysis | ✅ | ❌ | ✅ |

## Requirements

- **Node.js 18+** - Uses native `fetch` API
- **TypeScript 5+** - For full type support (optional)
- **Modern browsers** - Chrome, Firefox, Safari, Edge

## Yarn / pnpm

```bash
# Yarn
yarn add @webacy/sdk

# pnpm
pnpm add @webacy/sdk
```
