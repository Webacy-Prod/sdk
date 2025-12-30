// Client
export { TradingClient } from './client';

// Resources
export {
  HolderAnalysisResource,
  TradingLiteResource,
  TokensResource,
} from './resources';

// Types
export type {
  // Holder Analysis
  TokenHolder,
  TokenHolderActivity,
  BuyerHolding,
  FirstBuyersAnalysis,
  BlockRangeAnalysis,
  TimeSinceMintAnalysis,
  SniperAnalysis,
  ActivityPatterns,
  HolderAnalysisResult,
  HolderAnalysisOptions,
  // Trading Lite
  AddressHolding,
  TradingLiteAnalysis,
  TradingLiteOptions,
  // Tokens
  VolumeData,
  PoolData,
  TokenWithRisk,
  TokenRiskSummary,
  PoolsResponse,
  TrendingToken,
  TrendingTokensResponse,
  TrendingPoolsResponse,
  TokenPoolsOptions,
  TrendingOptions,
} from './types';

// Re-export commonly used types from core
export {
  Chain,
  ChainCompatibility,
  isEvmChain,
  CHAIN_NAMES,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
  type WebacyClientConfig,
  type TokenMetadata,
  type OwnershipDistribution,
  type TopHolder,
} from '@webacy/sdk-core';
