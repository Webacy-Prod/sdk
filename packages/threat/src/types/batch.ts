import { Chain } from '@webacy-xyz/sdk-core';

/**
 * Request for batch contract risk analysis
 */
export interface BatchContractsRequest {
  /** Contract addresses to analyze */
  addresses: string[];
  /** Target blockchain */
  chain: Chain;
}

/**
 * Response from batch contract risk analysis
 */
export interface BatchContractsResponse {
  /** Results keyed by address or as array */
  [key: string]: unknown;
}

/**
 * Request for batch address risk analysis
 */
export interface BatchAddressesRequest {
  /** Addresses to analyze */
  addresses: string[];
  /** Target blockchain */
  chain: Chain;
}

/**
 * Response from batch address risk analysis
 */
export interface BatchAddressesResponse {
  /** Results keyed by address or as array */
  [key: string]: unknown;
}

/**
 * Request for batch transaction risk analysis
 */
export interface BatchTransactionsRequest {
  /** Transaction hashes to analyze */
  transactions: string[];
  /** Target blockchain */
  chain: Chain;
}

/**
 * Response from batch transaction risk analysis
 */
export interface BatchTransactionsResponse {
  /** Results keyed by tx hash or as array */
  [key: string]: unknown;
}

/**
 * Options for batch requests
 */
export interface BatchOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
