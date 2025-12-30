import {
  HttpClient,
  HttpResponse,
  ValidationError,
  isValidAddress,
  CHAIN_NAMES,
  Chain,
} from '@rlajous/webacy-sdk-core';
import { HolderAnalysisResult, HolderAnalysisOptions } from '../types';

/**
 * Resource for token holder analysis
 *
 * Provides comprehensive analysis of token holder distribution including:
 * - Top holders and concentration metrics
 * - First buyers analysis
 * - Sniper detection with confidence scoring
 * - Bundler detection
 * - Developer wallet tracking
 *
 * @example
 * ```typescript
 * const analysis = await client.holderAnalysis.get('token_address', {
 *   chain: Chain.SOL,
 * });
 * console.log(`Sniper count: ${analysis.sniper_analysis?.sniper_count}`);
 *
 * // With default chain configured, chain can be omitted
 * const client = new TradingClient({ apiKey: '...', defaultChain: Chain.SOL });
 * const analysis = await client.holderAnalysis.get('token_address'); // Uses SOL
 * ```
 */
export class HolderAnalysisResource {
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
   * Get comprehensive holder analysis for a token
   *
   * Returns detailed analysis including:
   * - Token holder distribution
   * - First buyers analysis with bundler detection
   * - Sniper detection with confidence scoring
   * - Top 10 holders concentration
   * - Developer activity metrics
   *
   * @param address - Token address to analyze
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Complete holder analysis result
   *
   * @example
   * ```typescript
   * // Solana token analysis
   * const result = await client.holderAnalysis.get('pump_token_address', {
   *   chain: Chain.SOL,
   * });
   *
   * // With default chain configured
   * const result = await client.holderAnalysis.get('pump_token_address');
   *
   * // Check sniper activity
   * if (result.sniper_analysis?.sniper_count > 0) {
   *   console.log(`Found ${result.sniper_analysis.sniper_count} snipers`);
   *   console.log(`Sniper confidence: ${result.sniper_analysis.sniper_confidence_score}`);
   * }
   *
   * // Check bundler activity
   * const bundledBuyers = result.first_buyers_analysis.bundled_buyers_count;
   * if (bundledBuyers && bundledBuyers > 0) {
   *   console.log(`Found ${bundledBuyers} bundled buyers`);
   * }
   * ```
   */
  async get(
    address: string,
    options: HolderAnalysisOptions = {}
  ): Promise<HolderAnalysisResult> {
    const chain = this.resolveChain(options);

    // Validate token address format before making API call
    if (!isValidAddress(address, chain)) {
      const chainName = CHAIN_NAMES[chain] || chain;
      throw new ValidationError(
        `Invalid ${chainName} token address: "${address}". Please provide a valid token address format for the ${chainName} blockchain.`
      );
    }

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.disableRefetch !== undefined) {
      queryParams.append('disableRefetch', String(options.disableRefetch));
    }

    const response: HttpResponse<HolderAnalysisResult> = await this.httpClient.get(
      `/holder-analysis/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }
}
