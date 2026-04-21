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
