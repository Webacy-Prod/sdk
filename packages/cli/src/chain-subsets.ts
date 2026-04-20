import { Chain } from '@webacy-xyz/sdk-core';

/**
 * Chains exposed via the global `--chain` flag.
 *
 * Narrower than `Object.values(Chain)` — the enum includes `sep` (Sepolia
 * testnet) and `hedera`, neither of which is documented as a supported
 * production chain.
 */
export const SUPPORTED_CHAINS = [
  Chain.ETH,
  Chain.SOL,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.ARB,
  Chain.OPT,
  Chain.TON,
  Chain.SUI,
  Chain.STELLAR,
  Chain.BTC,
  Chain.SEI,
] as const;

export const QUICK_PROFILE_CHAINS = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
] as const;

export const TRANSACTION_CHAINS = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
  Chain.STELLAR,
] as const;

export const TOKEN_ECONOMICS_CHAINS = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
] as const;

export const TRADING_LITE_CHAINS = [Chain.SOL] as const;

/**
 * Risk tag types accepted by `rwa list --tags`. Mirrors `TokenType` in
 * `@webacy-xyz/sdk-threat`, kept as a local list for runtime validation
 * (the SDK exports it as a string-literal union only).
 */
export const RWA_TOKEN_TYPES = ['standard', 'yield', 'rwa', 'gold', 'bridged', 'vault'] as const;
