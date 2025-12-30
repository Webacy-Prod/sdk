import { Chain } from '@rlajous/webacy-sdk-core';

/**
 * Address holding details with initial and current amounts
 */
export interface AddressHolding {
  /** Wallet address */
  address: string;
  /** Percentage of total supply initially acquired at launch */
  initiallyAcquiredPercentage: number;
  /** Amount initially acquired (raw token amount) */
  initiallyAcquiredAmount: number;
  /** Percentage of total supply currently held */
  currentHoldingPercentage: number;
  /** Amount currently held (raw token amount) */
  currentHoldingAmount: number;
}

/**
 * Simplified bundling and sniper analysis result
 *
 * This is optimized for quick trading decisions with only the most
 * critical fields for assessing token safety.
 */
export interface TradingLiteAnalysis {
  /** CA: Contract/Token Address (mint address) */
  CA: string;
  /** DA: Deployer Address (developer/minter address) */
  DA: string;
  /** Percentage of total supply held by top 10 holders (current) */
  Top10Holders: number;
  /** Percentage of supply initially acquired by snipers at launch */
  SniperPercentageOnLaunch: number;
  /** Detailed list of sniper addresses with holdings */
  SniperAddresses: AddressHolding[];
  /** Detailed list of bundler addresses with holdings */
  BundlerAddresses: AddressHolding[];
  /** Percentage currently held by snipers */
  SniperPercentageHolding: number;
  /** Confidence score for sniper detection (0-100) */
  SniperConfidence: number | null;
  /** Percentage of supply initially acquired by bundlers at launch */
  BundlerPercentageOnLaunch: number;
  /** Percentage currently held by bundlers */
  BundlerPercentageHolding: number;
  /** Total number of unique holders */
  TotalHolders: number;
  /** Whether token has paid DexScreener features */
  DexScreenerPaid: boolean;
  /** Percentage currently held by developer */
  DevHoldingPercentage: number;
  /** Tokens launched by developer in last 24 hours */
  DevLaunched24Hours: number;
  /** Whether token can still be minted */
  mintable: boolean;
  /** Whether token accounts can be frozen */
  freezable: boolean;
  /** Last analyzed slot number */
  lastAnalyzedSlot?: number;
  /** Analysis timestamp */
  analysisTimestamp?: number;
}

/**
 * Options for trading lite requests
 */
export interface TradingLiteOptions {
  /** Target blockchain (currently only Solana supported) */
  chain?: Chain.SOL;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
