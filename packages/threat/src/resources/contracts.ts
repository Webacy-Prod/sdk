import { HttpResponse, BaseResource } from '@webacy-xyz/sdk-core';
import {
  ContractRiskResponse,
  ContractSourceCodeResponse,
  TokenTaxResponse,
  SolidityAnalysisRequest,
  SolidityAnalysisResponse,
  ContractAnalysisOptions,
  SourceCodeOptions,
  TaxOptions,
  CodeAnalysisResponse,
  CodeAnalysisOptions,
} from '../types';

/**
 * Resource for smart contract security analysis
 *
 * Provides comprehensive contract analysis including:
 * - Static and dynamic code analysis
 * - Vulnerability detection
 * - Source code verification
 * - Tax/fee detection
 * - Deployer risk analysis
 *
 * @example
 * ```typescript
 * // Analyze a contract
 * const risk = await client.contracts.analyze('0x...', { chain: Chain.ETH });
 *
 * // Get source code
 * const source = await client.contracts.getSourceCode('0x...', { chain: Chain.ETH });
 *
 * // With default chain configured, chain can be omitted
 * const client = new ThreatClient({ apiKey: '...', defaultChain: Chain.ETH });
 * const risk = await client.contracts.analyze('0x...'); // Uses ETH
 * ```
 */
export class ContractsResource extends BaseResource {
  /**
   * Analyze a smart contract for security risks
   *
   * Returns comprehensive analysis including:
   * - Risk score and categorization
   * - Vulnerability detection
   * - Source code analysis (if verified)
   * - Similar contracts
   * - Deployer risk (optional)
   *
   * @param address - Contract address
   * @param options - Analysis options (chain is optional if defaultChain is set)
   * @returns Contract risk analysis result
   *
   * @example
   * ```typescript
   * const result = await client.contracts.analyze('0xContract...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain, options can be omitted
   * const result = await client.contracts.analyze('0xContract...');
   *
   * console.log(`Risk score: ${result.score}`);
   * console.log(`Tags: ${result.tags.map(t => t.name).join(', ')}`);
   *
   * // Check for vulnerabilities
   * if (result.source_code_analysis && 'vulnerabilities' in result.source_code_analysis) {
   *   for (const vuln of result.source_code_analysis.vulnerabilities) {
   *     console.warn(`${vuln.severity}: ${vuln.title}`);
   *   }
   * }
   * ```
   */
  async analyze(
    address: string,
    options: ContractAnalysisOptions = {}
  ): Promise<ContractRiskResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.deployerRisk !== undefined) {
      queryParams.append('deployer_risk', String(options.deployerRisk));
    }

    const response: HttpResponse<ContractRiskResponse> = await this.httpClient.get(
      `/contracts/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get contract source code
   *
   * Returns source code and metadata for verified contracts.
   *
   * @param address - Contract address
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Contract source code and metadata
   *
   * @example
   * ```typescript
   * const source = await client.contracts.getSourceCode('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain configured
   * const source = await client.contracts.getSourceCode('0x...');
   *
   * if (source.is_verified) {
   *   console.log(`Contract: ${source.contract_name}`);
   *   console.log(`Compiler: ${source.compiler_version}`);
   * } else {
   *   console.log('Contract source not verified');
   * }
   * ```
   */
  async getSourceCode(
    address: string,
    options: SourceCodeOptions = {}
  ): Promise<ContractSourceCodeResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<ContractSourceCodeResponse> = await this.httpClient.get(
      `/contracts/${encodeURIComponent(address)}/source-code?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get token buy/sell taxes
   *
   * Analyzes token contracts for buy and sell taxes.
   *
   * @param address - Token contract address
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Tax information
   *
   * @example
   * ```typescript
   * const taxes = await client.contracts.getTaxes('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain configured
   * const taxes = await client.contracts.getTaxes('0x...');
   *
   * if (taxes.buyTaxPercentage !== null || taxes.sellTaxPercentage !== null) {
   *   console.log(`Buy tax: ${taxes.buyTaxPercentage}%`);
   *   console.log(`Sell tax: ${taxes.sellTaxPercentage}%`);
   * }
   * ```
   */
  async getTaxes(address: string, options: TaxOptions = {}): Promise<TokenTaxResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<TokenTaxResponse> = await this.httpClient.get(
      `/contracts/taxes/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Analyze Solidity source code
   *
   * Analyzes raw Solidity source code for vulnerabilities
   * without requiring deployment.
   *
   * @param request - Analysis request with source code
   * @returns Analysis results
   *
   * @example
   * ```typescript
   * const result = await client.contracts.analyzeSolidity({
   *   source_code: `
   *     pragma solidity ^0.8.0;
   *     contract MyToken {
   *       // ...
   *     }
   *   `,
   *   compiler_version: '0.8.19',
   * });
   *
   * if (result.success && result.results) {
   *   console.log(`Security score: ${result.results.security_score}`);
   *   for (const vuln of result.results.vulnerabilities) {
   *     console.warn(`${vuln.severity}: ${vuln.title}`);
   *   }
   * }
   * ```
   */
  async analyzeSolidity(
    request: SolidityAnalysisRequest,
    options?: { timeout?: number; signal?: AbortSignal }
  ): Promise<SolidityAnalysisResponse> {
    const response: HttpResponse<SolidityAnalysisResponse> = await this.httpClient.post(
      '/contracts/solidity-detector',
      request,
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }

  /**
   * Get static code analysis for a contract
   *
   * Performs static analysis on verified contract source code
   * to identify security vulnerabilities and code quality issues.
   *
   * @param address - Contract address
   * @param options - Analysis options (chain is optional if defaultChain is set)
   * @returns Code analysis result
   *
   * @example
   * ```typescript
   * const analysis = await client.contracts.getCodeAnalysis('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * console.log(`Security score: ${analysis.securityScore}`);
   * console.log(`Findings: ${analysis.findings.length}`);
   *
   * // Check for critical/high severity issues
   * const critical = analysis.findings.filter(f =>
   *   f.severity === 'critical' || f.severity === 'high'
   * );
   * for (const finding of critical) {
   *   console.warn(`${finding.severity}: ${finding.title}`);
   *   console.warn(`  ${finding.description}`);
   * }
   *
   * // Force refresh cache
   * const fresh = await client.contracts.getCodeAnalysis('0x...', {
   *   chain: Chain.ETH,
   *   refreshCache: true,
   * });
   * ```
   */
  async getCodeAnalysis(
    address: string,
    options: CodeAnalysisOptions = {}
  ): Promise<CodeAnalysisResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.refreshCache !== undefined) {
      queryParams.append('refreshCache', String(options.refreshCache));
    }

    const response: HttpResponse<CodeAnalysisResponse> = await this.httpClient.get(
      `/contracts/${encodeURIComponent(address)}/code-analysis?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }
}
