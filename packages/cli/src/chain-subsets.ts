import { Chain } from '@webacy-xyz/sdk-core';

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
