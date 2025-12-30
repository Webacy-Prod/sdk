import {
  HttpClient,
  HttpResponse,
  ValidationError,
  isValidAddress,
  CHAIN_NAMES,
  Chain,
} from '@webacy/sdk-core';
import {
  AddressRiskResponse,
  SanctionedResponse,
  PoisoningResponse,
  AddressAnalysisOptions,
  SanctionsOptions,
  PoisoningOptions,
} from '../types';

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
export class AddressesResource {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly defaultChain?: Chain
  ) {}

  /**
   * Resolve the chain to use for a request
   * @throws ValidationError if no chain is specified and no default is set
   */
  private resolveChain(options?: { chain?: Chain }): Chain {
    const chain = options?.chain ?? this.defaultChain;
    if (!chain) {
      throw new ValidationError(
        'Chain is required. Either specify chain in options or set defaultChain in client configuration.'
      );
    }
    return chain;
  }

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

    // Validate address format before making API call
    if (!isValidAddress(address, chain)) {
      const chainName = CHAIN_NAMES[chain] || chain;
      throw new ValidationError(
        `Invalid ${chainName} address: "${address}". Please provide a valid address format for the ${chainName} blockchain.`
      );
    }

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

    // Validate address format before making API call
    if (!isValidAddress(address, chain)) {
      const chainName = CHAIN_NAMES[chain] || chain;
      throw new ValidationError(
        `Invalid ${chainName} address: "${address}". Please provide a valid address format for the ${chainName} blockchain.`
      );
    }

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

    // Validate address format before making API call
    if (!isValidAddress(address, chain)) {
      const chainName = CHAIN_NAMES[chain] || chain;
      throw new ValidationError(
        `Invalid ${chainName} address: "${address}". Please provide a valid address format for the ${chainName} blockchain.`
      );
    }

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
}
