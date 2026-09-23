/**
 * Chain IDs for transaction scanning
 * 1=ETH, 56=BSC, 137=POL, 10=OPT, 42161=ARB, 8453=BASE
 */
export type ScanChainId = 1 | 56 | 137 | 10 | 42161 | 8453;

/**
 * Request body for scanning a transaction
 */
export interface ScanTransactionRequest {
  /** Transaction data */
  tx: {
    /** From address (signer) — must match the `fromAddress` path parameter */
    from: string;
    /**
     * Serialized transaction bytes (0x-prefixed hex): the unsigned transaction
     * to simulate before signing (ethers `Transaction.from({...}).unsignedSerialized`,
     * viem `serializeTransaction(...)`), or a 66-character hash of an
     * already-mined transaction.
     */
    raw: string;
  };
  /** Chain ID (1=ETH, 56=BSC, 137=POL, 10=OPT, 42161=ARB, 8453=BASE) */
  chain: ScanChainId;
  /** Block number for simulation (optional) */
  block?: number;
  /** Domain of the dApp (optional) */
  domain?: string;
}

/**
 * EIP-712 type definition
 */
export interface EIP712TypeDefinition {
  /** Field name */
  name: string;
  /** Field type */
  type: string;
}

/**
 * EIP-712 domain data
 */
export interface EIP712Domain {
  /** Chain ID */
  chainId: number;
  /** Verifying contract address */
  verifyingContract?: string;
  /** Domain name */
  name?: string;
  /** Domain version */
  version?: string;
}

/**
 * EIP-712 typed data
 */
export interface ScanEIP712TypedData {
  /** Type definitions */
  types: Record<string, EIP712TypeDefinition[]>;
  /** Primary type name */
  primaryType: string;
  /** Domain data */
  domain: EIP712Domain;
  /** Message content */
  message: Record<string, unknown>;
}

/**
 * Request body for scanning an EIP-712 message
 */
export interface ScanEIP712Request {
  /** Message data */
  msg: {
    /** From address (signer) — must match the `fromAddress` path parameter */
    from: string;
    /** EIP-712 typed data */
    data: ScanEIP712TypedData;
  };
  /** Domain (origin) of the dApp — when set the response carries `simulation.domainRisk` */
  domain?: string;
  /** Block number for simulation (optional) */
  block?: number;
}

/**
 * A risk tag attached to an address in a scan result
 */
export interface ScanRiskTag {
  /** Stable tag key (e.g. `HACK`, `drainer`, `associated_mixer`, `phishing_activities`) */
  key: string;
  /** Human-readable name */
  name: string;
  /** Tag type (e.g. `addressRisk`, `contractRisk`) */
  type?: string;
  /** Description of what the tag means */
  description?: string;
  /** Severity weight (10 = critical, e.g. HACK / DPRK / sanctioned) */
  severity?: number;
  /** Why the tag fired, when the engine gives a reason */
  reason?: string;
  /** Extra context (e.g. `detected_at`) */
  context?: Record<string, unknown>;
}

/**
 * A group of risk tags with the score they contribute
 */
export interface ScanRiskIssue {
  /** Score contributed by this issue */
  score?: number;
  /** Human-readable score bucket (e.g. `High Risk`) */
  riskScore?: string;
  /** Tags in this issue */
  tags: ScanRiskTag[];
  /** Risk categories this issue maps to */
  categories?: Record<string, unknown>;
}

/**
 * Risk profile of one address involved in a scan (signer, counterparty / spender, or token)
 *
 * `high` / `medium` are counts of findings at that severity; a `high > 0`
 * counterparty is a known drainer, hacker, sanctioned or otherwise flagged
 * address and should block or strongly warn before signing.
 */
export interface ScanAddressRisk {
  /** The address this profile describes */
  address: string;
  /** Overall risk score, 0–100 */
  overallRisk?: number;
  /** Number of high-severity findings */
  high?: number;
  /** Number of medium-severity findings */
  medium?: number;
  /** Number of findings */
  count?: number;
  /** Findings, grouped with the score they contribute */
  issues?: ScanRiskIssue[];
  /** Whether the address is a contract */
  isContract?: boolean;
  /** Address classification (e.g. `EOA`, `CONTRACT`) */
  addressType?: string;
  /** When the address was last analyzed (ISO 8601) */
  analyzed_at?: string;
  /** Provider details (address info, token info, taxes, …) */
  details?: Record<string, unknown>;
  /** Cache expiry of the profile (epoch ms), when served from cache */
  expiresAt?: number;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * Risk profile of the token contract of an asset movement — `address` is
 * `null` for the native asset (a plain ETH transfer), so guard before using it
 */
export type ScanAssetRisk = Omit<ScanAddressRisk, 'address'> & { address: string | null };

/**
 * Which provider produced a simulated asset change
 *
 * - `tenderly` / `debug_trace` — a pending-transaction simulation
 * - `receipt` — decoded from the receipt of a mined transaction (hash input)
 * - `calldata` — derived from the transaction's calldata / value when the
 *   simulation produced nothing to score (an `APPROVE`, a reverting call, …)
 */
export type ScanAssetChangeSource = 'tenderly' | 'debug_trace' | 'receipt' | 'calldata';

/**
 * One simulated asset movement (or approval) of a transaction
 *
 * A mined transaction (`tx.raw` = hash) whose receipt carries no decodable
 * transfer yields one placeholder item with no `changeType` / `assetType`
 * and an empty `counterpartyAddress` (`source: 'receipt'`).
 */
export interface ScanAssetChange {
  /**
   * `TRANSFER` for an asset movement, `APPROVE` for an allowance grant,
   * `CALL` when nothing decodable moves and the target contract itself is
   * scored (zero-value call, `source: 'calldata'`). Absent on the receipt
   * placeholder item described above.
   */
  changeType?: 'TRANSFER' | 'APPROVE' | 'CALL';
  /** Asset standard (`NATIVE`, `ERC20`, `ERC721`, `ERC1155`); absent on standard-agnostic entries */
  assetType?: string;
  /** Raw amount in the asset's smallest unit (absent for approvals) */
  rawAmount?: string;
  /** Token ID for NFTs */
  tokenId?: string;
  /** Token symbol, when resolved */
  symbol?: string;
  /** Token name, when resolved */
  name?: string;
  /** Sender (the signer for outgoing movements) */
  partyAddress: string;
  /** Recipient, or the spender for an approval */
  counterpartyAddress: string;
  /** Token contract, or `null` for the native asset */
  assetAddress: string | null;
  /** Which provider produced the change */
  source?: ScanAssetChangeSource;
  /**
   * Present on every `source: 'calldata'` item (absent on provider-derived
   * ones): `true` when the simulation reverted — the transaction cannot move
   * assets as simulated, but the recipient / spender / target it names is
   * still scored — `false` when the call simply moved no assets.
   */
  simulationReverted?: boolean;
}

/**
 * A known-risky function selector found in the calldata
 */
export interface ScanFunctionRisk {
  /** 4-byte selector */
  selector: string;
  /** Function name */
  functionName: string;
  /** Full function signature */
  signature?: string;
  /** Risk level of the function */
  riskLevel: 'low' | 'medium' | 'high' | 'suspicious';
  /** Risk category */
  category?: string;
  /** What the function can do */
  description?: string;
  /** Contextual risks (EIP-712 Safe transactions) */
  risks?: string[];
  /** Safe operation (`call` / `delegatecall`) for Safe transactions */
  safeOperation?: string;
  /** ML classifier score for Safe transactions, when enabled */
  safeMlScore?: number | null;
}

/**
 * Risk assessment of the dApp `domain` passed in the request
 */
export interface ScanDomainRisk {
  /** `low` | `medium` | `high`, or `unknown` when inconclusive */
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  /** Human-readable explanation */
  description?: string;
  /** Additional message */
  message?: string;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * One item of a transaction scan: an asset movement with the risk profiles of
 * the addresses involved
 */
export interface ScanSimulationItem {
  /** Risk profile of the sender (the signer) */
  partyRisk: ScanAddressRisk;
  /** Risk profile of the recipient / spender — the primary pre-sign signal */
  counterpartyRisk: ScanAddressRisk;
  /** Risk profile of the token contract (`address` is `null` for the native asset) */
  assetRisk: ScanAssetRisk;
  /** The simulated movement itself */
  txData: ScanAssetChange;
  /** Present when the calldata calls a known-risky function */
  functionRisk?: ScanFunctionRisk;
  /** Total pages of asset changes */
  totalPages?: number;
  /** Current page */
  currentPage?: number;
}

/**
 * Fields shared by every pre-sign scan response
 */
export interface ScanResponseBase {
  /** Identifier of the key that signed `descriptor` */
  public_key_id: string;
  /** Signed TLV descriptor of the verdict (for integrations that verify it on-device) */
  descriptor: string;
  /** Block number for a mined transaction; `null` for a pending one */
  block: number | null;
  /** Timestamp of the scan (ISO 8601) */
  timestamp: string;
}

/**
 * Transaction scan response
 *
 * `simulation` holds one item per simulated asset movement / approval. When
 * the simulation produced nothing to score (a reverting call, a call that
 * moves no assets) the API scores what the calldata names instead — the
 * recipient, the native `value`, or the target contract as a `CALL` item —
 * so an empty array only occurs for a contract creation.
 */
export interface ScanResponse extends ScanResponseBase {
  /** One entry per simulated asset movement or approval */
  simulation: ScanSimulationItem[];
  /**
   * Risk of the dApp `domain` passed in the request, when one was. Informational
   * on this route (it does not change the descriptor); the EIP-712 route carries
   * it as `simulation.domainRisk`.
   */
  domainRisk?: ScanDomainRisk;
  /** Chain slug (e.g. `eth`) */
  chain: string;
}

/**
 * EIP-712 scan simulation result
 */
export interface ScanEIP712Simulation {
  /** Risk of the dApp `domain`, when one was passed */
  domainRisk?: ScanDomainRisk;
  /** Risk profile of the contract(s) named in the typed data (`token` / `contract` fields, decoded calldata) */
  partyRisk?: ScanAddressRisk & { allAddressesChecked?: string[] };
  /** Risk profile of the recipient / spender named in the typed data (`to` / `recipient` / `spender` fields) */
  counterpartyRisk?: ScanAddressRisk & { allAddressesChecked?: string[] };
  /** Present when the typed data embeds calldata for a known-risky function */
  functionRisk?: ScanFunctionRisk;
  /**
   * ML classifier score for a Safe transaction, on cached responses only: when
   * the classification finishes after the first answer it is written back
   * here (or into `functionRisk.safeMlScore` when a `functionRisk` exists).
   */
  safeMlScore?: number | null;
}

/**
 * EIP-712 scan response
 */
export interface ScanEIP712Response extends ScanResponseBase {
  /** Analysis of the typed data */
  simulation: ScanEIP712Simulation;
  /** Chain slug (`eth`) */
  chain: string;
}

/**
 * Options for scan requests
 */
export interface ScanOptions {
  /** Force refresh cache */
  refreshCache?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for wallet risk scan requests
 */
export interface RiskScanOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: import('@webacy-xyz/sdk-core').Chain;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Response from initiating a wallet risk scan
 */
export interface RiskScanResponse {
  /** Whether the scan was successfully initiated */
  success?: boolean;
  /** Scan status */
  status?: string;
  /** Message from the API */
  message?: string;
  /** Additional data */
  [key: string]: unknown;
}

/**
 * Response from polling wallet risk scan status
 */
export interface RiskScanStatusResponse {
  /** Current scan status */
  status: string;
  /** Risk score result (available when complete) */
  score?: number;
  /** Risk data (available when complete) */
  data?: Record<string, unknown>;
  /** Additional fields */
  [key: string]: unknown;
}
