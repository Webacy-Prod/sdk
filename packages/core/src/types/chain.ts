/**
 * Supported blockchain networks
 */
export enum Chain {
  /** Ethereum Mainnet */
  ETH = 'eth',
  /** Ethereum Sepolia Testnet */
  SEP = 'sep',
  /** Arbitrum One */
  ARB = 'arb',
  /** Polygon (MATIC) */
  POL = 'pol',
  /** Solana */
  SOL = 'sol',
  /** Optimism */
  OPT = 'opt',
  /** Base */
  BASE = 'base',
  /** BNB Smart Chain */
  BSC = 'bsc',
  /** TON (The Open Network) */
  TON = 'ton',
  /** Sei */
  SEI = 'sei',
  /** Bitcoin */
  BTC = 'btc',
  /** Sui */
  SUI = 'sui',
  /** Stellar */
  STELLAR = 'stellar',
}

/**
 * Chain compatibility groups for feature detection
 */
export enum ChainCompatibility {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
  TON = 'TON',
  BTC = 'BTC',
  SEI = 'SEI',
  SUI = 'SUI',
  STELLAR = 'STELLAR',
}

/**
 * Get the compatibility group for a chain
 *
 * Uses exhaustive switch to ensure all chain values are handled.
 * TypeScript will error at compile time if a new Chain value is added
 * but not handled here.
 */
export function getChainCompatibility(chain: Chain): ChainCompatibility {
  switch (chain) {
    case Chain.ETH:
    case Chain.SEP:
    case Chain.ARB:
    case Chain.POL:
    case Chain.OPT:
    case Chain.BASE:
    case Chain.BSC:
      return ChainCompatibility.EVM;
    case Chain.SOL:
      return ChainCompatibility.SOLANA;
    case Chain.TON:
      return ChainCompatibility.TON;
    case Chain.BTC:
      return ChainCompatibility.BTC;
    case Chain.SEI:
      return ChainCompatibility.SEI;
    case Chain.SUI:
      return ChainCompatibility.SUI;
    case Chain.STELLAR:
      return ChainCompatibility.STELLAR;
    default: {
      // Exhaustive check - TypeScript will error if a Chain value is not handled
      const _exhaustiveCheck: never = chain;
      throw new Error(`Unhandled chain: ${String(_exhaustiveCheck)}`);
    }
  }
}

/**
 * Check if a chain is EVM-compatible
 */
export function isEvmChain(chain: Chain): boolean {
  return getChainCompatibility(chain) === ChainCompatibility.EVM;
}

/**
 * Chain ID mapping for EVM chains
 *
 * Only EVM-compatible chains have numeric chain IDs (EIP-155).
 * Non-EVM chains (SOL, TON, BTC, SEI, SUI, STELLAR) use different
 * identification schemes and are intentionally omitted.
 */
export const CHAIN_IDS: Partial<Record<Chain, number>> = {
  [Chain.ETH]: 1,
  [Chain.SEP]: 11155111,
  [Chain.BSC]: 56,
  [Chain.POL]: 137,
  [Chain.OPT]: 10,
  [Chain.ARB]: 42161,
  [Chain.BASE]: 8453,
};

/**
 * Human-readable chain names
 */
export const CHAIN_NAMES: Record<Chain, string> = {
  [Chain.ETH]: 'Ethereum',
  [Chain.SEP]: 'Sepolia',
  [Chain.ARB]: 'Arbitrum',
  [Chain.POL]: 'Polygon',
  [Chain.SOL]: 'Solana',
  [Chain.OPT]: 'Optimism',
  [Chain.BASE]: 'Base',
  [Chain.BSC]: 'BNB Smart Chain',
  [Chain.TON]: 'TON',
  [Chain.SEI]: 'Sei',
  [Chain.BTC]: 'Bitcoin',
  [Chain.SUI]: 'Sui',
  [Chain.STELLAR]: 'Stellar',
};
