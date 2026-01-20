import {
  BaseResource,
  HttpResponse,
  ValidationError,
  isValidSolanaAddress,
  Chain,
} from '@webacy-xyz/sdk-core';
import { TradingLiteAnalysis, TradingLiteOptions } from '../types';

/**
 * Resource for simplified trading analysis
 *
 * Provides quick, simplified token analysis optimized for trading decisions.
 * Returns only the most critical fields needed to assess token safety.
 *
 * Currently supports Solana only.
 *
 * @example
 * ```typescript
 * const analysis = await client.tradingLite.analyze('token_address');
 * console.log(`Sniper % on launch: ${analysis.SniperPercentageOnLaunch}`);
 * console.log(`Bundler % holding: ${analysis.BundlerPercentageHolding}`);
 * ```
 */
export class TradingLiteResource extends BaseResource {
  // Note: defaultChain parameter accepted for consistency but trading-lite only supports Solana

  /**
   * Get simplified bundling and sniper analysis for a token
   *
   * Returns critical trading metrics including:
   * - Sniper and bundler detection with percentages
   * - Top 10 holder concentration
   * - Developer activity (holdings, 24h launches)
   * - Token security flags (mintable, freezable)
   * - DexScreener paid status
   *
   * Optimized for performance with caching:
   * - First call: Runs full analysis and persists data
   * - Subsequent calls: Returns cached static data with real-time holdings
   *
   * @param address - Token address to analyze (Solana only)
   * @param options - Request options
   * @returns Simplified bundling analysis
   *
   * @example
   * ```typescript
   * const analysis = await client.tradingLite.analyze('pump_token_address');
   *
   * // Quick safety check
   * const isRisky =
   *   analysis.SniperPercentageOnLaunch > 20 ||
   *   analysis.BundlerPercentageOnLaunch > 30 ||
   *   analysis.DevLaunched24Hours > 5;
   *
   * if (isRisky) {
   *   console.warn('Token shows high-risk indicators');
   * }
   *
   * // Check token permissions
   * if (analysis.mintable) {
   *   console.warn('Token supply can still be increased');
   * }
   * if (analysis.freezable) {
   *   console.warn('Token accounts can be frozen');
   * }
   * ```
   */
  async analyze(address: string, options: TradingLiteOptions = {}): Promise<TradingLiteAnalysis> {
    // Trading lite only supports Solana - reject other chains explicitly
    const providedChain = options.chain;
    if (providedChain && providedChain !== Chain.SOL) {
      throw new ValidationError(
        `Trading Lite only supports Solana. Received chain: "${String(providedChain)}". Please use Chain.SOL or omit the chain parameter.`
      );
    }
    const chain = Chain.SOL;

    // Trading lite only supports Solana - validate address format
    if (!isValidSolanaAddress(address)) {
      throw new ValidationError(
        `Invalid Solana token address: "${address}". Trading Lite only supports Solana tokens. Please provide a valid base58 Solana address.`
      );
    }

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<TradingLiteAnalysis> = await this.httpClient.get(
      `/trading-lite/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }
}
