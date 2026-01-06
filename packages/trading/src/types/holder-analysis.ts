import { Chain, OwnershipDistribution, TokenMetadata } from '@webacy/sdk-core';

/**
 * Token holder information
 */
export interface TokenHolder {
  /** Holder wallet address */
  address: string;
  /** Token balance */
  balance: number;
  /** Percentage of total supply */
  supply_percentage: number;
  /** Raw balance as string for large numbers */
  rawBalance?: string;
  /** Enhanced activity data (EVM chains) */
  activity?: TokenHolderActivity;
}

/**
 * Enhanced holder activity data (available for EVM chains)
 */
export interface TokenHolderActivity {
  /** First transaction date (ISO 8601 string) */
  firstTransactionDate?: string;
  /** Last transaction date (ISO 8601 string) */
  lastTransactionDate?: string;
  totalIncomingTransactions?: number;
  totalIncomingAmount?: number;
  totalOutgoingTransactions?: number;
  totalOutgoingAmount?: number;
  netFlow?: number;
  tradingFrequency?: number;
  isActiveTrader?: boolean;
  retentionDays?: number;
  avgIncomingSize?: number;
  avgOutgoingSize?: number;
  daysSinceLastActivity?: number;
  holderClassification?: string;
  balanceDiscrepancy?: boolean;
  reportedBalance?: number;
  calculatedBalance?: number;
}

/**
 * Current holding information for a buyer
 */
export interface BuyerHolding {
  /** Wallet address */
  address: string;
  /** Current token balance */
  balance: number;
  /** Current percentage of total supply */
  supply_percentage: number;
  /** Whether this buyer is a bundler */
  is_bundler?: boolean;
  /** Whether this buyer is a sniper */
  is_sniper?: boolean;
  /** Whether this is a developer wallet */
  is_developer?: boolean;
}

/**
 * First buyers analysis result
 */
export interface FirstBuyersAnalysis {
  /** Percentage of supply initially acquired by first buyers */
  initially_acquired_percentage: number;
  /** Total number of first traders analyzed */
  buyers_analyzed_count: number;
  /** Actual number of unique buyers */
  unique_buyers_count?: number;
  /** True when unique_buyers_count < 20 */
  buyer_segmentation_limited?: boolean;
  /** Percentage bought by top 10 buyers */
  top_10_buyers_bought_percentage: number;
  /** Percentage bought by top 5 buyers */
  top_5_buyers_bought_percentage: number;
  /** Percentage bought by top 20 buyers */
  top_20_buyers_bought_percentage: number;
  /** Percentage bought in the same block */
  bundled_percentage_supply_bought?: number;
  /** Number of buys in the same block */
  buys_in_same_block_count?: number;
  /** Current holding percentage of first buyers */
  current_holding_percentage: number | null;
  /** Current holding percentage of bundled buyers */
  bundled_current_holding_percentage?: number | null;
  /** Number of first buyers still holding */
  buyers_still_holding_count: number | null;
  /** Number of bundled buyers still holding */
  bundled_buyers_still_holding_count: number | null;
  /** Average percentage held by bundler buyers */
  average_percentage_bundler_buyer: number | null;
  /** Count of first buyers who transferred out */
  buyers_transferred_out_count: number | null;
  /** Distinct addresses that received supply */
  distributed_to_distinct_addresses_count: number;
  /** Percentage transferred out by first buyers */
  transferred_out_from_initially_acquired_percentage: number | null;
  /** Number of buyers in the same block */
  bundled_buyers_count: number | null;
  /** Complete list of ALL bundled addresses (including sold out) */
  all_bundled_addresses: string[];
  /** Timestamp of analysis */
  timestamp: string;
  /** Current percentage per initial buyer */
  current_percentage_per_buyer: BuyerHolding[];
  /** Percentage currently held by snipers */
  snipers_current_holding_percentage: number | null;
  /** Number of snipers still holding */
  snipers_still_holding_count: number | null;
  /** Percentage held by snipers still holding */
  snipers_still_holding_percentage: number | null;
  /** Percentage held by development team */
  dev_holdings_percentage?: number | null;
}

/**
 * Block range analysis for sniper detection
 */
export interface BlockRangeAnalysis {
  block_hash: string;
  timestamp: string;
  buy_count: number;
  block_number: number;
  addresses: string[];
  supply_percentage: number;
}

/**
 * Time since mint analysis
 */
export interface TimeSinceMintAnalysis {
  time_range_seconds: number;
  buy_count: number;
  addresses: string[];
  supply_percentage: number;
}

/**
 * Sniper detection analysis result
 */
export interface SniperAnalysis {
  /** List of identified sniper addresses */
  sniper_addresses: string[];
  /** Total number of snipers detected */
  sniper_count: number;
  /** Total percentage held by snipers */
  sniper_total_percentage: number;
  /** Analysis by block range */
  block_range_analysis: BlockRangeAnalysis[];
  /** Analysis by time since mint */
  time_since_mint_analysis: TimeSinceMintAnalysis[];
  /** Average time since mint in seconds */
  average_time_since_mint: number;
  /** Median time since mint in seconds */
  median_time_since_mint: number;
  /** Whether frontrunning was detected */
  potential_frontrunning_detected: boolean;
  /** Confidence score (0-100) */
  sniper_confidence_score: number;
}

/**
 * Activity patterns analysis (EVM chains)
 */
export interface ActivityPatterns {
  earlyAdopters: TokenHolder[];
  activeTraders: TokenHolder[];
  longTermHolders: TokenHolder[];
  recentBuyers: TokenHolder[];
  suspiciousPatterns: {
    highFrequencyTraders: TokenHolder[];
    sameTimeBuyers: TokenHolder[];
    unusualFlow: TokenHolder[];
  };
}

/**
 * Complete holder analysis result
 */
export interface HolderAnalysisResult {
  /** Token address */
  token_address: string;
  /** Total number of holders */
  total_holders_count?: number;
  /** Token mint transaction hash */
  token_mint_tx?: string;
  /** Token mint timestamp */
  token_mint_time?: string;
  /** Minter/deployer address */
  minter?: string;
  /** Total supply used for calculations */
  total_supply?: number;
  /** Token metadata */
  metadata?: TokenMetadata;
  /** First buyers analysis */
  first_buyers_analysis: FirstBuyersAnalysis;
  /** Top 10 holders analysis */
  top_10_holders_analysis?: OwnershipDistribution;
  /** Tokens launched by developer in 24h */
  dev_launched_tokens_in_24_hours?: number | null;
  /** Sniper detection analysis */
  sniper_analysis?: SniperAnalysis;
  /** Activity patterns (EVM chains) */
  activity_patterns?: ActivityPatterns;
}

/**
 * Options for holder analysis requests
 */
export interface HolderAnalysisOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Skip cache and force fresh fetch */
  disableRefetch?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
