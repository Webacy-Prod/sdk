/**
 * Supported ledger device families
 */
export type LedgerFamily = 'ethereum' | 'solana' | 'bitcoin';

/**
 * Transaction data for ledger scanning
 */
export interface LedgerTransactionData {
  /** From address */
  from: string;
  /** Raw transaction data */
  raw: string;
  /** To address (optional) */
  to?: string;
  /** Value in wei (optional) */
  value?: string;
  /** Transaction data (optional) */
  data?: string;
}

/**
 * Ledger transaction scan request
 */
export interface LedgerScanRequest {
  /** Transaction data */
  tx: LedgerTransactionData;
  /** Chain ID */
  chain: number;
}

/**
 * EIP-712 typed data for signing
 */
export interface EIP712TypedData {
  /** Domain data */
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  /** Message data */
  message: Record<string, unknown>;
  /** Primary type */
  primaryType: string;
  /** Type definitions */
  types: Record<string, Array<{ name: string; type: string }>>;
}

/**
 * Ledger EIP-712 scan request
 */
export interface LedgerEIP712Request {
  /** Signer address */
  signer: string;
  /** Typed data to sign */
  typedData: EIP712TypedData;
  /** Chain ID */
  chain: number;
}

/**
 * Risk detected in ledger scan
 */
export interface LedgerRisk {
  /** Risk type */
  type: string;
  /** Risk level */
  level: 'low' | 'medium' | 'high' | 'critical';
  /** Risk description */
  description: string;
  /** Recommendation */
  recommendation?: string;
}

/**
 * Ledger scan response
 */
export interface LedgerScanResponse {
  /** Whether transaction is safe */
  is_safe: boolean;
  /** Overall risk level */
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  /** Risks detected */
  risks: LedgerRisk[];
  /** Decoded transaction data */
  decoded?: {
    /** Function name if contract call */
    function_name?: string;
    /** Function signature */
    function_signature?: string;
    /** Decoded parameters */
    parameters?: Record<string, unknown>;
  };
  /** Recommendations */
  recommendations?: string[];
}

/**
 * Options for ledger scan requests
 */
export interface LedgerScanOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
