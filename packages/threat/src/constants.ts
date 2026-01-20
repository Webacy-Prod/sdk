import { Chain } from '@webacy-xyz/sdk-core';
import type { ScanChainId } from './types/scan';

/**
 * Valid chain IDs for transaction scanning
 */
export const VALID_SCAN_CHAIN_IDS: ScanChainId[] = [1, 56, 137, 10, 42161, 8453];

/**
 * Supported chains for transaction analysis
 */
export const SUPPORTED_TX_CHAINS: Chain[] = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
  Chain.STELLAR,
];

/**
 * Supported chains for quick profile
 */
export const SUPPORTED_QUICK_PROFILE_CHAINS: Chain[] = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
];
