import { Chain, RiskTag, RiskCategory, TokenStandard } from '@rlajous/webacy-sdk-core';

/**
 * Transaction risk issue
 */
export interface TransactionIssue {
  /** Risk score */
  score: number;
  /** Risk tags */
  tags: RiskTag[];
  /** Risk categories */
  categories: Record<string, RiskCategory>;
  /** Transaction details */
  transaction: TransactionDetails;
}

/**
 * Transaction details
 */
export interface TransactionDetails {
  /** Transaction hash */
  transaction_hash?: string;
  /** Block number */
  block_number?: number;
  /** Timestamp */
  timestamp?: number;
  /** Formatted datetime */
  datetime?: string;
  /** Counterparty address */
  from_to_address?: string;
  /** Transaction direction */
  direction?: 'in' | 'out';
  /** Contract address if applicable */
  contract_address?: string;
  /** Token ID for NFTs */
  token_id?: string;
  /** Token type */
  token_type?: TokenStandard;
  /** Whether counterparty is a contract */
  is_contract?: boolean;
  /** Token name */
  token_name?: string;
  /** Function called */
  function_name?: string;
  /** Whether counterparty is sanctioned */
  sanctioned_address?: boolean;
}

/**
 * Wallet transactions response
 */
export interface WalletTransactionsResponse {
  /** Total issue count */
  count: number;
  /** Medium severity count */
  medium: number;
  /** High severity count */
  high: number;
  /** Overall risk score */
  overallRisk?: number;
  /** Transaction issues */
  issues: TransactionIssue[];
  /** Error message */
  error?: string;
}

/**
 * Token approval information
 */
export interface TokenApproval {
  /** Spender address */
  spender: string;
  /** Token address */
  token_address: string;
  /** Token name */
  token_name?: string;
  /** Token symbol */
  token_symbol?: string;
  /** Approved amount */
  amount: string;
  /** Whether unlimited approval */
  is_unlimited: boolean;
  /** Approval timestamp */
  approved_at?: string;
  /** Spender risk score */
  spender_risk?: number;
}

/**
 * Wallet approvals response
 */
export interface WalletApprovalsResponse {
  /** List of token approvals */
  approvals: TokenApproval[];
  /** Total count */
  count: number;
  /** High risk approval count */
  high_risk_count: number;
}

/**
 * Options for wallet transaction requests
 */
export interface WalletTransactionsOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Number of transactions to return */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for wallet approvals requests
 */
export interface WalletApprovalsOptions {
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
