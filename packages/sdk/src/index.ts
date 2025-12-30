// Unified client
export { WebacyClient, type TradingNamespace, type ThreatNamespace } from './client';

// Re-export trading types
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
} from '@webacy/sdk-trading';

// Re-export threat types
export type {
  // Address types
  RiskIssue,
  FundFlowRisk,
  FundFlowData,
  AddressInfo,
  TokenRiskInfo,
  TaxInfo,
  AccessControlInfo,
  AddressDetails,
  DeployerRisk,
  AddressRiskResponse,
  SanctionedResponse,
  PoisoningResponse,
  AddressAnalysisOptions,
  SanctionsOptions,
  PoisoningOptions,
  // Contract types
  ContractRiskResponse,
  SourceCodeAnalysis,
  Vulnerability,
  ContractSourceCodeResponse,
  TokenTaxResponse,
  SolidityAnalysisRequest,
  SolidityAnalysisResponse,
  ContractAnalysisOptions,
  SourceCodeOptions,
  TaxOptions,
  // URL types
  UrlRiskResponse,
  UrlAddResponse,
  UrlCheckOptions,
  // Wallet types
  TransactionIssue,
  TransactionDetails,
  WalletTransactionsResponse,
  TokenApproval,
  WalletApprovalsResponse,
  WalletTransactionsOptions,
  WalletApprovalsOptions,
  // Ledger types
  LedgerFamily,
  LedgerTransactionData,
  LedgerScanRequest,
  EIP712TypedData,
  LedgerEIP712Request,
  LedgerRisk,
  LedgerScanResponse,
  LedgerScanOptions,
  // Account trace types
  AccountTraceResponse,
  TraceConnection,
  TraceSummary,
  AccountTraceOptions,
  // Usage types
  UsageData,
  CurrentUsageResponse,
  UsagePlan,
  UsagePlansResponse,
  UsageOptions,
} from '@webacy/sdk-threat';

// Re-export core types and utilities
export {
  // Chain
  Chain,
  ChainCompatibility,
  getChainCompatibility,
  isEvmChain,
  CHAIN_IDS,
  CHAIN_NAMES,
  // Risk modules
  RiskModule,
  // Enums
  RiskScore,
  RiskLevel,
  TypeOfAddress,
  TokenStandard,
  // Errors
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
  // HTTP
  DEFAULT_RETRY_CONFIG,
  // Utils
  isValidAddress,
  isValidEvmAddress,
  isValidSolanaAddress,
  isValidBitcoinAddress,
  isValidTonAddress,
  isValidSuiAddress,
  isValidStellarAddress,
  normalizeAddress,
  normalizeEvmAddress,
} from '@webacy/sdk-core';

// Re-export core types
export type {
  WebacyClientConfig,
  RiskTag,
  InformationalTag,
  RiskCategory,
  ConsolidatedRiskResult,
  OwnershipDistribution,
  TopHolder,
  AddressLabelInfo,
  LiquidityPoolData,
  LpHolder,
  TokenMetadata,
  TokenLinks,
  BuySellTaxes,
  RequestOptions,
  PaginationOptions,
  PaginatedResponse,
  RetryConfig,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from '@webacy/sdk-core';

// Re-export individual clients for advanced usage
export { TradingClient } from '@webacy/sdk-trading';
export { ThreatClient } from '@webacy/sdk-threat';
