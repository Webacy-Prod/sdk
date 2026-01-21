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
    /** From address (signer) */
    from: string;
    /** Raw transaction data */
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
    /** From address (signer) */
    from: string;
    /** EIP-712 typed data */
    data: ScanEIP712TypedData;
  };
  /** Domain of the dApp (optional) */
  domain?: string;
  /** Block number for simulation (optional) */
  block?: number;
}

/**
 * Risk classification
 */
export type ScanRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Scan result warning/risk
 */
export interface ScanWarning {
  /** Warning type/code */
  type: string;
  /** Warning description */
  description: string;
  /** Risk level */
  severity: ScanRiskLevel;
  /** Additional details */
  details?: Record<string, unknown>;
}

/**
 * Asset change from transaction simulation
 */
export interface AssetChange {
  /** Asset type (native, token, nft) */
  type: 'native' | 'token' | 'nft';
  /** Asset symbol */
  symbol?: string;
  /** Asset name */
  name?: string;
  /** Asset address (for tokens/NFTs) */
  address?: string;
  /** Change amount (positive=receive, negative=send) */
  amount?: string;
  /** USD value */
  usdValue?: string;
  /** Token ID (for NFTs) */
  tokenId?: string;
  /** Decimals */
  decimals?: number;
}

/**
 * Transaction scan response
 */
export interface ScanResponse {
  /** Overall risk level */
  riskLevel: ScanRiskLevel;
  /** Risk score (0-100) */
  riskScore?: number;
  /** Warnings/risks identified */
  warnings: ScanWarning[];
  /** Simulated asset changes */
  assetChanges?: AssetChange[];
  /** Contract interaction details */
  contractDetails?: {
    /** Contract address */
    address?: string;
    /** Contract name */
    name?: string;
    /** Function being called */
    function?: string;
    /** Is verified */
    isVerified?: boolean;
  };
  /** Domain risk assessment */
  domainRisk?: {
    /** Domain is known malicious */
    isMalicious?: boolean;
    /** Domain reputation score */
    reputationScore?: number;
    /** Risk details */
    details?: string;
  };
  /** Simulation success */
  simulationSuccess?: boolean;
  /** Simulation error if failed */
  simulationError?: string;
}

/**
 * EIP-712 scan response
 */
export interface ScanEIP712Response {
  /** Overall risk level */
  riskLevel: ScanRiskLevel;
  /** Risk score (0-100) */
  riskScore?: number;
  /** Warnings/risks identified */
  warnings: ScanWarning[];
  /** Message type analysis */
  messageType?: {
    /** Primary type */
    primaryType: string;
    /** Is known permit/approval type */
    isPermit?: boolean;
    /** Is known order type (e.g., Seaport) */
    isOrder?: boolean;
    /** Protocol name if recognized */
    protocol?: string;
  };
  /** Spender analysis (for permits) */
  spenderAnalysis?: {
    /** Spender address */
    address?: string;
    /** Spender risk level */
    riskLevel?: ScanRiskLevel;
    /** Is known contract */
    isKnownContract?: boolean;
    /** Contract name */
    contractName?: string;
  };
  /** Domain risk assessment */
  domainRisk?: {
    /** Domain is known malicious */
    isMalicious?: boolean;
    /** Domain reputation score */
    reputationScore?: number;
    /** Risk details */
    details?: string;
  };
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
