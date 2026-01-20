import { Chain, RiskTag, RiskCategory, TokenMetadata } from '@webacy-xyz/sdk-core';
import { AddressRiskResponse } from './address';

/**
 * Contract analysis response
 */
export interface ContractRiskResponse {
  /** Risk score */
  score: number;
  /** Identified risk tags */
  tags: RiskTag[];
  /** Categorized risk information */
  categories: Record<string, RiskCategory>;
  /** Analysis data */
  analysis?: unknown;
  /** Token metadata */
  metadata?: TokenMetadata;
  /** Source code analysis result */
  source_code_analysis?: SourceCodeAnalysis | { error: string } | { message: string };
  /** Similar contracts found */
  similar_contracts?: unknown[];
  /** Analysis job status */
  analysis_status?: string;
  /** Analysis type */
  analysis_type?: string;
  /** Deployer information */
  deployer?: {
    address?: string;
    risk?: AddressRiskResponse;
    deployed_contracts?: unknown[];
  };
}

/**
 * Source code analysis result
 */
export interface SourceCodeAnalysis {
  /** Whether source code is verified */
  is_verified: boolean;
  /** Compiler version */
  compiler_version?: string;
  /** Contract name */
  contract_name?: string;
  /** Vulnerabilities found */
  vulnerabilities?: Vulnerability[];
  /** Security score */
  security_score?: number;
}

/**
 * Vulnerability information
 */
export interface Vulnerability {
  /** Vulnerability ID */
  id: string;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Affected lines */
  lines?: number[];
}

/**
 * Contract source code response
 */
export interface ContractSourceCodeResponse {
  /** Whether source is verified */
  is_verified: boolean;
  /** Source code content */
  source_code?: string;
  /** ABI */
  abi?: unknown[];
  /** Compiler version */
  compiler_version?: string;
  /** Contract name */
  contract_name?: string;
  /** Constructor arguments */
  constructor_arguments?: string;
  /** License type */
  license?: string;
}

/**
 * Token tax response
 */
export interface TokenTaxResponse {
  /** Buy tax percentage */
  buyTaxPercentage: number | null;
  /** Sell tax percentage */
  sellTaxPercentage: number | null;
  /** Token address */
  tokenAddress: string;
  /** Chain */
  chain: string;
}

/**
 * Solidity analysis request
 */
export interface SolidityAnalysisRequest {
  /** Solidity source code */
  source_code: string;
  /** Compiler version (optional) */
  compiler_version?: string;
}

/**
 * Solidity analysis response
 */
export interface SolidityAnalysisResponse {
  /** Whether analysis was successful */
  success: boolean;
  /** Analysis results */
  results?: {
    vulnerabilities: Vulnerability[];
    security_score: number;
    recommendations: string[];
  };
  /** Error message if failed */
  error?: string;
}

/**
 * Options for contract analysis
 */
export interface ContractAnalysisOptions {
  /**
   * Target blockchain
   *
   * Optional if `defaultChain` was set in the client configuration.
   */
  chain?: Chain;
  /** Include deployer risk */
  deployerRisk?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for source code requests
 */
export interface SourceCodeOptions {
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
 * Options for tax requests
 */
export interface TaxOptions {
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
 * Code analysis finding
 */
export interface CodeAnalysisFinding {
  /** Finding ID/type */
  id: string;
  /** Finding title */
  title: string;
  /** Finding description */
  description: string;
  /** Severity level */
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  /** Confidence level */
  confidence?: 'low' | 'medium' | 'high';
  /** Affected code locations */
  locations?: Array<{
    file?: string;
    line?: number;
    column?: number;
    snippet?: string;
  }>;
  /** Recommendation to fix */
  recommendation?: string;
}

/**
 * Static code analysis response
 */
export interface CodeAnalysisResponse {
  /** Contract address */
  contractAddress: string;
  /** Chain */
  chain: string;
  /** Whether source code is verified */
  isVerified: boolean;
  /** Contract name */
  contractName?: string;
  /** Compiler version */
  compilerVersion?: string;
  /** Overall security score (0-100) */
  securityScore?: number;
  /** Analysis findings */
  findings: CodeAnalysisFinding[];
  /** Summary counts by severity */
  summary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  /** Analysis timestamp */
  analyzedAt?: string;
  /** Whether result is from cache */
  fromCache?: boolean;
}

/**
 * Options for code analysis requests
 */
export interface CodeAnalysisOptions {
  /**
   * Target blockchain (EVM chains only)
   *
   * Required parameter.
   */
  chain: Chain;
  /** Force refresh cache */
  refreshCache?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
