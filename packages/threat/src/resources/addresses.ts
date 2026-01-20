import { HttpResponse, BaseResource, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import {
  AddressRiskResponse,
  SanctionedResponse,
  PoisoningResponse,
  AddressAnalysisOptions,
  SanctionsOptions,
  PoisoningOptions,
  QuickProfileResponse,
  QuickProfileOptions,
} from '../types';
import { SUPPORTED_QUICK_PROFILE_CHAINS } from '../constants';

/**
 * Resource for address risk analysis
 *
 * Provides comprehensive security analysis for blockchain addresses including:
 * - Overall risk scoring
 * - Risk categorization and tagging
 * - Sanctions screening
 * - Address poisoning detection
 * - Fund flow analysis
 *
 * @example
 * ```typescript
 * // Analyze an address
 * const risk = await client.addresses.analyze('0x...', { chain: Chain.ETH });
 *
 * // Check sanctions
 * const sanctioned = await client.addresses.checkSanctioned('0x...', { chain: Chain.ETH });
 *
 * // With default chain configured, chain can be omitted
 * const client = new ThreatClient({ apiKey: '...', defaultChain: Chain.ETH });
 * const risk = await client.addresses.analyze('0x...'); // Uses ETH
 * ```
 */
export class AddressesResource extends BaseResource {
  /**
   * Analyze an address for security risks
   *
   * Returns comprehensive risk analysis including:
   * - Overall risk score (0-100)
   * - Risk tags and categories
   * - Detailed analysis data (optional)
   * - Deployer risk for contracts (optional)
   *
   * @param address - Address to analyze
   * @param options - Analysis options (chain is optional if defaultChain is set)
   * @returns Address risk analysis result
   *
   * @example
   * ```typescript
   * // Basic analysis
   * const risk = await client.addresses.analyze('0x742d35Cc...', {
   *   chain: Chain.ETH,
   * });
   * console.log(`Risk score: ${risk.overallRisk}`);
   *
   * // With default chain, options can be omitted
   * const risk = await client.addresses.analyze('0x742d35Cc...');
   *
   * // With specific modules
   * const risk = await client.addresses.analyze('0x...', {
   *   chain: Chain.ETH,
   *   modules: [RiskModule.SANCTIONS_COMPLIANCE, RiskModule.FUND_FLOW_SCREENING],
   * });
   *
   * // With detailed response and deployer risk
   * const risk = await client.addresses.analyze('0x...', {
   *   chain: Chain.ETH,
   *   detailed: true,
   *   deployerRisk: true,
   * });
   * ```
   */
  async analyze(
    address: string,
    options: AddressAnalysisOptions = {}
  ): Promise<AddressRiskResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.modules && options.modules.length > 0) {
      for (const module of options.modules) {
        queryParams.append('modules', module);
      }
    }

    if (options.detailed !== undefined) {
      queryParams.append('detailed', String(options.detailed));
    }

    if (options.deployerRisk !== undefined) {
      queryParams.append('deployer_risk', String(options.deployerRisk));
    }

    const response: HttpResponse<AddressRiskResponse> = await this.httpClient.get(
      `/addresses/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Check if an address is sanctioned
   *
   * Screens the address against known sanctions lists including OFAC.
   *
   * @param address - Address to check
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Sanctions check result
   *
   * @example
   * ```typescript
   * const result = await client.addresses.checkSanctioned('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain configured
   * const result = await client.addresses.checkSanctioned('0x...');
   *
   * if (result.is_sanctioned) {
   *   console.error('Address is sanctioned!');
   *   console.log('Details:', result.sanction_details);
   * }
   * ```
   */
  async checkSanctioned(
    address: string,
    options: SanctionsOptions = {}
  ): Promise<SanctionedResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<SanctionedResponse> = await this.httpClient.get(
      `/addresses/sanctioned/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Check for address poisoning attacks
   *
   * Detects if an address has been targeted by address poisoning
   * (dust attack) attempts.
   *
   * @param address - Address to check
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Poisoning detection result
   *
   * @example
   * ```typescript
   * const result = await client.addresses.checkPoisoning('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain configured
   * const result = await client.addresses.checkPoisoning('0x...');
   *
   * if (result.is_poisoned) {
   *   console.warn('Address poisoning detected!');
   *   console.log('Similar addresses:', result.poisoning_details?.similar_addresses);
   * }
   * ```
   */
  async checkPoisoning(
    address: string,
    options: PoisoningOptions = {}
  ): Promise<PoisoningResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<PoisoningResponse> = await this.httpClient.get(
      `/addresses/${encodeURIComponent(address)}/poisoning?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get a quick risk profile for an address
   *
   * Returns a lightweight risk assessment including:
   * - Risk score and level
   * - Risk tags
   * - Token approvals (optional)
   * - Account age and activity summary
   *
   * @param address - Address to analyze
   * @param options - Request options
   * @returns Quick profile result
   *
   * @example
   * ```typescript
   * // Basic quick profile
   * const profile = await client.addresses.getQuickProfile('0x...', {
   *   chain: Chain.ETH,
   * });
   * console.log(`Risk score: ${profile.riskScore}`);
   *
   * // With token approvals
   * const profile = await client.addresses.getQuickProfile('0x...', {
   *   chain: Chain.ETH,
   *   withApprovals: true,
   * });
   * for (const approval of profile.approvals ?? []) {
   *   console.log(`${approval.symbol} approved to ${approval.spenderName}`);
   * }
   *
   * // Hide trust flags
   * const profile = await client.addresses.getQuickProfile('0x...', {
   *   chain: Chain.ETH,
   *   hideTrustFlags: true,
   * });
   * ```
   */
  async getQuickProfile(
    address: string,
    options: QuickProfileOptions = {}
  ): Promise<QuickProfileResponse> {
    const chain = this.resolveQuickProfileChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.withApprovals !== undefined) {
      queryParams.append('withApprovals', String(options.withApprovals));
    }

    if (options.hideTrustFlags !== undefined) {
      queryParams.append('hide_trust_flags', String(options.hideTrustFlags));
    }

    const response: HttpResponse<QuickProfileResponse> = await this.httpClient.get(
      `/quick-profile/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Resolve the chain for quick profile requests
   */
  private resolveQuickProfileChain(options?: { chain?: Chain }): Chain {
    const chain = options?.chain ?? this.defaultChain;
    if (!chain) {
      throw new ValidationError(
        'Chain is required. Either specify chain in options or set defaultChain in client configuration.'
      );
    }
    if (!SUPPORTED_QUICK_PROFILE_CHAINS.includes(chain)) {
      throw new ValidationError(
        `Chain "${chain}" is not supported for quick profile. Supported chains: ${SUPPORTED_QUICK_PROFILE_CHAINS.join(', ')}`
      );
    }
    return chain;
  }
}
