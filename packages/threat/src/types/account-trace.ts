import { Chain } from '@webacy-xyz/sdk-core';

/**
 * Account trace response
 */
export interface AccountTraceResponse {
  /** Source address */
  address: string;
  /** Traced connections */
  connections: TraceConnection[];
  /** Summary statistics */
  summary: TraceSummary;
}

/**
 * Traced connection to another address
 */
export interface TraceConnection {
  /** Connected address */
  address: string;
  /** Relationship type */
  relationship: 'sent_to' | 'received_from' | 'interacted_with';
  /** Total value transferred */
  total_value?: string;
  /** Transaction count */
  tx_count: number;
  /** First interaction */
  first_seen?: string;
  /** Last interaction */
  last_seen?: string;
  /** Address labels */
  labels?: string[];
  /** Risk indicators */
  risk_flags?: string[];
}

/**
 * Trace summary statistics
 */
export interface TraceSummary {
  /** Total unique connections */
  total_connections: number;
  /** High risk connections */
  high_risk_connections: number;
  /** Total value sent */
  total_sent?: string;
  /** Total value received */
  total_received?: string;
  /** Sanctioned connections */
  sanctioned_connections: number;
  /** Mixer connections */
  mixer_connections: number;
}

/**
 * Options for account trace requests
 */
export interface AccountTraceOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Trace depth (number of hops) */
  depth?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
