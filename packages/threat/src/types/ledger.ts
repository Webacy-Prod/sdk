import type {
  ScanEIP712Simulation,
  ScanEIP712TypedData,
  ScanResponseBase,
  ScanSimulationItem,
} from './scan';

/**
 * Supported ledger device families
 *
 * The API currently serves `ethereum` only.
 */
export type LedgerFamily = 'ethereum' | 'solana' | 'bitcoin';

/**
 * Transaction data for ledger scanning
 */
export interface LedgerTransactionData {
  /** From address */
  from: string;
  /**
   * Serialized transaction bytes (0x-prefixed hex): the unsigned transaction
   * to simulate before signing, or a 66-character hash of a mined transaction.
   */
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
  /** Block number for simulation (optional) */
  block?: number;
  /** Domain (origin) of the dApp (optional) */
  domain?: string;
}

/**
 * EIP-712 typed data for signing
 */
export type EIP712TypedData = ScanEIP712TypedData;

/**
 * Ledger EIP-712 scan request — same envelope as `POST /scan/{fromAddress}/eip712`
 */
export interface LedgerEIP712Request {
  /** Message data */
  msg: {
    /** Signer address */
    from: string;
    /** Typed data to sign (`domain.chainId` selects the chain; only `1` is supported) */
    data: EIP712TypedData;
  };
  /** Domain (origin) of the dApp — when set the response carries `simulation.domainRisk` */
  domain?: string;
  /** Block number for simulation (optional) */
  block?: number;
}

/**
 * Ledger transaction scan response
 *
 * Same payload as `POST /scan/{fromAddress}/transactions` minus the `chain`
 * echo: one `simulation` item per asset movement / approval, plus the signed
 * TLV `descriptor` the device verifies.
 */
export interface LedgerScanResponse extends ScanResponseBase {
  /** One entry per simulated asset movement or approval */
  simulation: ScanSimulationItem[];
}

/**
 * Ledger EIP-712 scan response
 */
export interface LedgerEIP712ScanResponse extends ScanResponseBase {
  /** Analysis of the typed data */
  simulation: ScanEIP712Simulation;
}

/**
 * Options for ledger scan requests
 */
export interface LedgerScanOptions {
  /** Force refresh cache */
  refreshCache?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
