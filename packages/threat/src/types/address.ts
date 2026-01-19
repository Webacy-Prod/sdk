import {
  Chain,
  RiskTag,
  InformationalTag,
  RiskCategory,
  RiskModule,
  TypeOfAddress,
  TokenStandard,
} from '@webacy-xyz/sdk-core';

/**
 * Risk issue details
 */
export interface RiskIssue {
  /** Numeric risk score */
  score: number;
  /** Identified risk tags */
  tags: RiskTag[];
  /** Categorized risk information */
  categories: Record<string, RiskCategory>;
}

/**
 * Fund flow risk indicators
 */
export interface FundFlowRisk {
  /** Connected to OFAC sanctioned addresses */
  ofac?: boolean;
  /** Connected to known hacker addresses */
  hacker?: boolean;
  /** Used coin mixing services */
  mixers?: boolean;
  /** Connected to drainer contracts */
  drainer?: boolean;
  /** FBI IC3 reported */
  fbi_ic3?: boolean;
  /** Used Tornado Cash */
  tornado?: boolean;
}

/**
 * Fund flow analysis data
 */
export interface FundFlowData {
  /** Risk indicators */
  risk?: FundFlowRisk;
  /** Additional flow details */
  [key: string]: unknown;
}

/**
 * Address information details
 */
export interface AddressInfo {
  /** Address label name */
  name?: string;
  /** Address label category */
  category?: string;
  /** Whether this is an exchange address */
  is_exchange?: boolean;
  /** Exchange name if applicable */
  exchange_name?: string;
  /** Label information */
  label_info?: {
    name?: string;
    category?: string;
    subcategory?: string;
  };
}

/**
 * Token risk information
 */
export interface TokenRiskInfo {
  /** Token name */
  name?: string;
  /** Token symbol */
  symbol?: string;
  /** Token decimals */
  decimals?: number;
  /** Token standard */
  token_standard?: TokenStandard;
}

/**
 * Buy/sell tax information
 */
export interface TaxInfo {
  /** Has buy tax */
  has_buy_tax?: boolean;
  /** Has sell tax */
  has_sell_tax?: boolean;
  /** Buy tax percentage */
  buy_tax_percentage?: number;
  /** Sell tax percentage */
  sell_tax_percentage?: number;
}

/**
 * Access control information
 */
export interface AccessControlInfo {
  /** Contract owner address */
  owner?: string;
  /** Is contract upgradeable */
  is_upgradeable?: boolean;
  /** Has admin functions */
  has_admin_functions?: boolean;
}

/**
 * Detailed response data
 */
export interface AddressDetails {
  /** Address information */
  address_info?: AddressInfo;
  /** Fund flow analysis */
  fund_flows?: FundFlowData;
  /** Token metadata risk */
  token_metadata_risk?: TokenRiskInfo;
  /** Token risk data */
  token_risk?: TokenRiskInfo;
  /** Market data */
  marketData?: {
    current_price?: number;
    market_cap?: number;
    total_volume?: number;
  };
  /** Access control data */
  access_control?: AccessControlInfo;
  /** Buy/sell taxes */
  buy_sell_taxes?: TaxInfo;
  /** Tokens launched by developer in 24h */
  dev_launched_tokens_in_24_hours?: number | null;
  /** Source code analysis */
  source_code_analysis?: unknown;
  /** Token security features */
  token_security?: {
    is_mintable: boolean;
    is_freezable: boolean;
    blacklist_function: boolean;
    whitelist_function: boolean;
  };
  /** Governance features */
  governance?: {
    is_upgradeable: boolean;
    has_admin_functions: boolean;
    centralized_control: boolean;
  };
}

/**
 * Deployer risk information
 */
export interface DeployerRisk {
  /** Deployer address */
  address?: string;
  /** Deployer risk analysis */
  risk?: AddressRiskResponse;
}

/**
 * Complete address risk analysis response
 */
export interface AddressRiskResponse {
  /** Total number of issues */
  count: number;
  /** Medium severity issue count */
  medium: number;
  /** High severity issue count */
  high: number;
  /** Overall risk score (0-100) */
  overallRisk?: number;
  /** List of risk issues */
  issues: RiskIssue[];
  /** Whether address is a contract */
  isContract?: boolean;
  /** Detailed address type classification */
  addressType?: TypeOfAddress;
  /** Token standard if applicable */
  tokenStandard?: TokenStandard;
  /** Detailed analysis data */
  details?: AddressDetails;
  /** Contextual information (non-risk) */
  context?: InformationalTag[];
  /** Modules that were analyzed */
  analysis_modules?: RiskModule[];
  /** Whether analysis was partial */
  partial_analysis?: boolean;
  /** Available modules for this address */
  available_modules?: RiskModule[];
  /** Total execution time */
  total_execution_time_ms?: number;
  /** Total holder count */
  total_holders_count?: number;
  /** Deployer risk (for contracts) */
  deployer?: DeployerRisk;
  /** Error message if any */
  error?: string;
}

/**
 * Sanctions check response
 */
export interface SanctionedResponse {
  /** Whether address is sanctioned */
  is_sanctioned: boolean;
  /** Sanction details if sanctioned */
  sanction_details?: {
    /** Source of sanction */
    source?: string;
    /** Sanction list name */
    list_name?: string;
    /** Date added to list */
    date_added?: string;
  };
}

/**
 * Address poisoning check response
 */
export interface PoisoningResponse {
  /** Whether poisoning was detected */
  is_poisoned: boolean;
  /** Poisoning details */
  poisoning_details?: {
    /** Similar addresses used in poisoning */
    similar_addresses?: string[];
    /** Dust transaction count */
    dust_tx_count?: number;
    /** First poisoning date */
    first_seen?: string;
  };
}

/**
 * Options for address analysis requests
 */
export interface AddressAnalysisOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Specific risk modules to run */
  modules?: RiskModule[];
  /** Include detailed response */
  detailed?: boolean;
  /** Include deployer risk for contracts */
  deployerRisk?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for sanctions check
 */
export interface SanctionsOptions {
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
 * Options for poisoning check
 */
export interface PoisoningOptions {
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
