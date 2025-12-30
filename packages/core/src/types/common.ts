import { Chain } from './chain';
import { RiskModule } from './modules';

/**
 * Risk tag describing a specific security concern
 */
export interface RiskTag {
  /** Human-readable name */
  name: string;
  /** Unique identifier key */
  key: string;
  /** Category type */
  type: string;
  /** Detailed description */
  description: string;
  /** Severity level (0-100, higher = more severe) */
  severity?: number;
}

/**
 * Informational tag (non-risk metadata)
 */
export interface InformationalTag {
  name: string;
  key: string;
  type: string;
  description: string;
  /** Optional count for display (e.g., "2 active ads") */
  count?: number;
}

/**
 * Risk category grouping related tags
 */
export interface RiskCategory {
  name: string;
  key: string;
  gradedDescription?: {
    high: string;
    medium: string;
    low: string;
  };
  description?: string;
  tags?: Record<string, boolean>;
}

/**
 * Risk score classification
 */
export enum RiskScore {
  HIGH = 'High Risk',
  MEDIUM = 'Medium Risk',
  LOW = 'Low Risk',
  TRUSTED = 'Trusted',
  UNKNOWN = 'Unknown',
}

/**
 * Risk level enum
 */
export enum RiskLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Suspicious = 'suspicious',
}

/**
 * Consolidated risk analysis result
 */
export interface ConsolidatedRiskResult {
  /** Numeric risk score (0-100) */
  score: number;
  /** List of identified risk tags */
  tags: RiskTag[];
  /** Categorized risk information */
  categories: Record<string, RiskCategory>;
  /** Human-readable risk classification */
  riskScore?: RiskScore;
  /** Additional analysis data */
  analysis?: unknown;
}

/**
 * Token ownership distribution data
 */
export interface OwnershipDistribution {
  /** Total supply of the token */
  totalSupply?: number | string;
  /** Percentage held by top 10 holders (0-100) */
  percentageHeldByTop10?: number;
  /** Percentage held by top 5 holders (0-100) */
  percentageHeldByTop5?: number;
  /** Percentage held by top 20 holders (0-100) */
  percentageHeldByTop20?: number;
  /** Total number of unique holders */
  totalHoldersCount?: number;
  /** Top holders with balances */
  topHolders?: TopHolder[];
}

/**
 * Top holder information
 */
export interface TopHolder {
  /** Account address */
  accountAddress?: string;
  /** Human-readable alias */
  alias?: string;
  /** Owner address */
  ownerAddress: string;
  /** Token amount held */
  amount: number | string;
  /** Percentage of total supply */
  percentage?: number;
  /** Address label information */
  label_info?: AddressLabelInfo;
}

/**
 * Address label information
 */
export interface AddressLabelInfo {
  /** Label name */
  name?: string;
  /** Label category */
  category?: string;
  /** Label subcategory */
  subcategory?: string;
}

/**
 * Liquidity pool data
 */
export interface LiquidityPoolData {
  /** DEX name */
  dexName?: string;
  /** Pool address */
  address?: string;
  /** LP token mint address */
  lpMint?: string;
  /** Trading pair address */
  pairAddress?: string;
  /** Total liquidity value */
  totalLiquidity?: number;
  /** Type of liquidity */
  liquidityType?: string;
  /** Percentage of locked liquidity */
  lockedLiquidityPercent?: number;
  /** LP token holders */
  lpHolders?: LpHolder[];
}

/**
 * LP token holder
 */
export interface LpHolder {
  address?: string;
  balance?: number;
  percent?: number;
  isLocked?: boolean;
  lockedUntil?: Date;
  isContract?: boolean;
}

/**
 * Token metadata
 */
export interface TokenMetadata {
  /** Token name */
  name?: string;
  /** Token symbol */
  symbol?: string;
  /** Token logo URL */
  logo?: string;
  /** Token decimals */
  decimals?: number;
  /** Token description */
  description?: string;
  /** Social links */
  links?: TokenLinks;
}

/**
 * Token social and website links
 */
export interface TokenLinks {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
}

/**
 * Buy/sell tax information
 */
export interface BuySellTaxes {
  has_buy_tax?: boolean;
  has_sell_tax?: boolean;
  buy_tax_percentage?: number;
  sell_tax_percentage?: number;
}

/**
 * Address type classification
 */
export enum TypeOfAddress {
  EOA = 'EOA',
  CONTRACT = 'CONTRACT',
  TOKEN = 'TOKEN',
  CONTRACT_WALLET = 'CONTRACT_WALLET',
  MULTISIG = 'MULTISIG',
}

/**
 * Token standard
 */
export enum TokenStandard {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  SPL = 'SPL',
  JETTON = 'JETTON',
  STELLAR_ASSET = 'STELLAR_ASSET',
  SUI_COIN = 'SUI_COIN',
}

/**
 * Common request options
 */
export interface RequestOptions {
  /** Target blockchain */
  chain: Chain;
  /** Specific risk modules to analyze */
  modules?: RiskModule[];
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal for request cancellation */
  signal?: AbortSignal;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Cursor for cursor-based pagination */
  cursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Data items */
  data: T[];
  /** Pagination metadata */
  pagination: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
}
