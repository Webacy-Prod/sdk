import { Chain } from '@webacy-xyz/sdk-core';
import type { OhlcvTimeFrame } from './types/tokens';

/**
 * Supported chains for token economics
 */
export const SUPPORTED_TOKEN_ECONOMICS_CHAINS: Chain[] = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
];

/**
 * Valid time frames for OHLCV
 */
export const VALID_TIME_FRAMES: OhlcvTimeFrame[] = ['minute', 'hour', 'day'];
