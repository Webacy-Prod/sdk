import { Chain, RiskTag, RiskCategory } from '@webacy-xyz/sdk-core';

/**
 * Supported chains for transaction analysis
 */
export type TransactionChain =
  | typeof Chain.ETH
  | typeof Chain.BASE
  | typeof Chain.BSC
  | typeof Chain.POL
  | typeof Chain.OPT
  | typeof Chain.ARB
  | typeof Chain.SOL
  | typeof Chain.STELLAR;

/**
 * Transaction risk analysis response
 */
export interface TransactionRiskResponse {
  /** Transaction hash */
  txHash: string;
  /** Chain of the transaction */
  chain: string;
  /** Risk score (0-100) */
  riskScore?: number;
  /** Risk tags */
  tags?: RiskTag[];
  /** Categorized risk information */
  categories?: Record<string, RiskCategory>;
  /** Transaction details */
  details?: TxRiskDetails;
  /** Trust flags (hidden if hide_trust_flags is true) */
  trustFlags?: TrustFlag[];
}

/**
 * Transaction details
 */
export interface TxRiskDetails {
  /** From address */
  from?: string;
  /** To address */
  to?: string;
  /** Transaction value */
  value?: string;
  /** Gas used */
  gasUsed?: string;
  /** Gas price */
  gasPrice?: string;
  /** Block number */
  blockNumber?: number;
  /** Timestamp */
  timestamp?: string;
  /** Transaction status */
  status?: 'success' | 'failed' | 'pending';
  /** Method called */
  method?: string;
  /** Decoded input */
  decodedInput?: unknown;
}

/**
 * Trust flag information
 */
export interface TrustFlag {
  /** Flag type */
  type: string;
  /** Flag description */
  description?: string;
  /** Flag value */
  value?: unknown;
}

/**
 * Options for transaction analysis
 */
export interface TransactionOptions {
  /**
   * Target blockchain
   *
   * Supported: eth, base, bsc, pol, opt, arb, sol, stellar
   */
  chain?: TransactionChain;
  /** Hide trust flags from response */
  hideTrustFlags?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
