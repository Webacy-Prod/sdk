import { HttpResponse, BaseResource } from '@webacy-xyz/sdk-core';
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
export class HolderAnalysisResource extends BaseResource {
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
  async get(address: string, options: HolderAnalysisOptions = {}): Promise<HolderAnalysisResult> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

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
