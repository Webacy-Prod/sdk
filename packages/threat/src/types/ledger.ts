import type {
  ScanEIP712Simulation,
  ScanEIP712TypedData,
  ScanResponseBase,
  ScanSimulationItem,
} from './scan';

/**
 * Supported ledger device families
 *
 * The API serves `ethereum` only; the route parameter is not validated
 * server-side, so any other value would silently run an Ethereum scan.
 */
export type LedgerFamily = 'ethereum';

/**
 * Transaction data for ledger scanning
 *
 * Only `from` and `raw` reach the API (its Ledger DTO strips every other key),
 * so the transaction's `to` / `value` / `data` must be inside `raw`.
 */
export interface LedgerTransactionData {
  /** From address */
  from: string;
  /**
   * Serialized transaction bytes (0x-prefixed hex): the unsigned transaction
   * to simulate before signing, or a 66-character hash of a mined transaction.
   */
  raw: string;
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
 * EIP-712 domain for the Ledger route
 *
 * Unlike `POST /scan/{fromAddress}/eip712`, the Ledger route requires every
 * domain field as a non-empty string — `name`, `version` and
 * `verifyingContract` are not optional here. `chainId` may be given as a
 * number; `LedgerResource.scanEip712` sends it as the string the route
 * validates.
 */
export interface LedgerEIP712Domain {
  /** Domain name (required by the Ledger route) */
  name: string;
  /** Domain version (required by the Ledger route) */
  version: string;
  /** Chain ID — only `1` (Ethereum mainnet) is supported */
  chainId: number | string;
  /** Verifying contract address (required by the Ledger route) */
  verifyingContract: string;
}

/**
 * EIP-712 typed data for the Ledger route: the scan resource's shape with the
 * stricter `LedgerEIP712Domain`
 */
export type EIP712TypedData = Omit<ScanEIP712TypedData, 'domain'> & {
  /** Domain data (all four fields required, see `LedgerEIP712Domain`) */
  domain: LedgerEIP712Domain;
};

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
