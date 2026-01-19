import { Chain, TokenMetadata } from '@webacy-xyz/sdk-core';

/**
 * Volume data across different time periods
 */
export interface VolumeData {
  /** 5 minute volume */
  m5: string;
  /** 15 minute volume */
  m15: string;
  /** 30 minute volume */
  m30: string;
  /** 1 hour volume */
  h1: string;
  /** 6 hour volume */
  h6: string;
  /** 24 hour volume */
  h24: string;
}

/**
 * Normalized pool data
 */
export interface PoolData {
  /** Pool address */
  address: string;
  /** Pool name */
  name: string;
  /** Fully diluted valuation */
  fdv: string;
  /** Base token address */
  base_token?: string;
  /** Quote token address */
  quote_token?: string;
  /** Market cap */
  market_cap: string | null;
  /** Total reserve value */
  reserve: string;
  /** Pool creation timestamp */
  created_at: string;
  /** Token price */
  token_price: string;
  /** Base token price */
  base_token_price: string;
  /** Quote token price */
  quote_token_price: string;
  /** Volume across time periods */
  volume: VolumeData;
}

/**
 * Token with risk analysis
 */
export interface TokenWithRisk {
  /** Token address */
  address: string;
  /** Risk analysis result */
  risk: TokenRiskSummary;
  /** Token metadata */
  metadata?: TokenMetadata;
}

/**
 * Summary of token risk
 */
export interface TokenRiskSummary {
  /** Number of issues found */
  count: number;
  /** Medium severity issues */
  medium: number;
  /** High severity issues */
  high: number;
  /** Overall risk score (0-100) */
  overallRisk?: number;
}

/**
 * Pools response with token risks
 */
export interface PoolsResponse {
  /** List of pools */
  pools: PoolData[];
  /** Tokens with risk analysis */
  tokens: TokenWithRisk[];
}

/**
 * Trending token data
 */
export interface TrendingToken {
  /** Token address */
  address: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Current price in USD */
  price_usd?: number;
  /** 24h price change percentage */
  price_change_24h?: number;
  /** 24h trading volume */
  volume_24h?: number;
  /** Market cap */
  market_cap?: number;
  /** Risk analysis */
  risk?: TokenRiskSummary;
}

/**
 * Trending tokens response
 */
export interface TrendingTokensResponse {
  /** List of trending tokens */
  tokens: TrendingToken[];
}

/**
 * Trending pools response
 */
export interface TrendingPoolsResponse {
  /** List of trending pools */
  pools: PoolData[];
}

/**
 * Options for token pool requests
 */
export interface TokenPoolsOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for trending requests
 */
export interface TrendingOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Number of results to return */
  limit?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
