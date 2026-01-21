import { BaseClient, WebacyClientConfig } from '@webacy-xyz/sdk-core';
import { HolderAnalysisResource } from './resources/holder-analysis';
import { TradingLiteResource } from './resources/trading-lite';
import { TokensResource } from './resources/tokens';

/**
 * Webacy Trading SDK Client
 *
 * Provides access to token trading analysis including holder analysis,
 * sniper/bundler detection, and trending tokens.
 *
 * @example
 * ```typescript
 * import { TradingClient, Chain } from '@webacy-xyz/sdk-trading';
 *
 * const client = new TradingClient({
 *   apiKey: process.env.WEBACY_API_KEY!,
 * });
 *
 * // Comprehensive holder analysis
 * const holders = await client.holderAnalysis.get('token_address', {
 *   chain: 'sol',
 * });
 *
 * // Quick trading analysis (Solana)
 * const trading = await client.tradingLite.analyze('pump_token');
 *
 * // Token pools and trending
 * const pools = await client.tokens.getPools('token_address', { chain: 'eth' });
 * ```
 */
export class TradingClient extends BaseClient {
  /**
   * Holder analysis resource
   *
   * Provides comprehensive analysis of token holder distribution including:
   * - Top holders and concentration metrics
   * - First buyers analysis
   * - Sniper detection with confidence scoring
   * - Bundler detection
   * - Developer wallet tracking
   */
  public readonly holderAnalysis: HolderAnalysisResource;

  /**
   * Trading lite resource
   *
   * Provides quick, simplified token analysis optimized for trading decisions.
   * Currently supports Solana only.
   */
  public readonly tradingLite: TradingLiteResource;

  /**
   * Tokens resource
   *
   * Provides access to token pools and trending data.
   */
  public readonly tokens: TokensResource;

  /**
   * Create a new TradingClient instance
   *
   * @param config - Client configuration
   * @throws AuthenticationError if API key is not provided
   *
   * @example
   * ```typescript
   * // Basic setup
   * const client = new TradingClient({
   *   apiKey: 'your-api-key',
   * });
   *
   * // With default chain (omit chain in API calls)
   * const client = new TradingClient({
   *   apiKey: 'your-api-key',
   *   defaultChain: Chain.SOL,
   * });
   *
   * // With custom configuration
   * const client = new TradingClient({
   *   apiKey: 'your-api-key',
   *   timeout: 60000,
   *   retry: {
   *     maxRetries: 5,
   *   },
   * });
   * ```
   */
  constructor(config: WebacyClientConfig) {
    super(config);

    // Initialize resources with the HTTP client and default chain
    this.holderAnalysis = new HolderAnalysisResource(this.httpClient, this.defaultChain);
    this.tradingLite = new TradingLiteResource(this.httpClient, this.defaultChain);
    this.tokens = new TokensResource(this.httpClient, this.defaultChain);
  }

  // Interceptor methods (addRequestInterceptor, addResponseInterceptor, addErrorInterceptor)
  // are inherited from BaseClient and don't need to be overridden.
}
