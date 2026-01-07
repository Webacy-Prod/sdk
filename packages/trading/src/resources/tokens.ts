import { HttpResponse, BaseResource } from '@webacy/sdk-core';
import {
  PoolsResponse,
  TrendingTokensResponse,
  TrendingPoolsResponse,
  TokenPoolsOptions,
  TrendingOptions,
} from '../types';

/**
 * Resource for token pools and trending data
 *
 * Provides access to:
 * - Token liquidity pools with risk analysis
 * - Trending tokens across chains
 * - Trending liquidity pools
 *
 * @example
 * ```typescript
 * // Get trending tokens
 * const trending = await client.tokens.getTrending({ chain: Chain.SOL });
 *
 * // Get pools for a specific token
 * const pools = await client.tokens.getPools('token_address', { chain: Chain.ETH });
 *
 * // With default chain configured, chain can be omitted
 * const client = new TradingClient({ apiKey: '...', defaultChain: Chain.SOL });
 * const pools = await client.tokens.getPools('token_address'); // Uses SOL
 * ```
 */
export class TokensResource extends BaseResource {
  /**
   * Get liquidity pools for a token with risk analysis
   *
   * Returns all liquidity pools where the token is traded,
   * along with risk analysis for the tokens in each pool.
   *
   * @param address - Token address
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Pools with token risk analysis
   *
   * @example
   * ```typescript
   * const result = await client.tokens.getPools('0x...', { chain: Chain.ETH });
   *
   * // With default chain configured
   * const result = await client.tokens.getPools('0x...');
   *
   * for (const pool of result.pools) {
   *   console.log(`Pool: ${pool.name}`);
   *   console.log(`Liquidity: ${pool.reserve}`);
   *   console.log(`24h Volume: ${pool.volume.h24}`);
   * }
   *
   * // Check risk for tokens in pools
   * for (const token of result.tokens) {
   *   if (token.risk.overallRisk && token.risk.overallRisk > 70) {
   *     console.warn(`High risk token: ${token.address}`);
   *   }
   * }
   * ```
   */
  async getPools(address: string, options: TokenPoolsOptions = {}): Promise<PoolsResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<PoolsResponse> = await this.httpClient.get(
      `/tokens/${encodeURIComponent(address)}/pools?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get trending tokens
   *
   * Returns currently trending tokens based on trading activity
   * and community interest.
   *
   * @param options - Request options (chain is optional)
   * @returns List of trending tokens with risk analysis
   *
   * @example
   * ```typescript
   * const trending = await client.tokens.getTrending({ chain: Chain.SOL, limit: 20 });
   *
   * // Or with default chain configured
   * const trending = await client.tokens.getTrending();
   *
   * for (const token of trending.tokens) {
   *   console.log(`${token.symbol}: $${token.price_usd}`);
   *   console.log(`24h change: ${token.price_change_24h}%`);
   *
   *   if (token.risk?.overallRisk && token.risk.overallRisk > 50) {
   *     console.warn('  Warning: Elevated risk');
   *   }
   * }
   * ```
   */
  async getTrending(options: TrendingOptions = {}): Promise<TrendingTokensResponse> {
    const queryParams = new URLSearchParams();
    const chain = options.chain ?? this.defaultChain;

    if (chain) {
      queryParams.append('chain', chain);
    }
    if (options.limit !== undefined) {
      queryParams.append('limit', String(options.limit));
    }

    const queryString = queryParams.toString();
    const path = queryString ? `/tokens/trending?${queryString}` : '/tokens/trending';

    const response: HttpResponse<TrendingTokensResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * Get trending liquidity pools
   *
   * Returns currently trending liquidity pools based on
   * trading volume and activity.
   *
   * @param options - Request options (chain is optional)
   * @returns List of trending pools
   *
   * @example
   * ```typescript
   * const trending = await client.tokens.getTrendingPools({ chain: Chain.ETH });
   *
   * // Or with default chain configured
   * const trending = await client.tokens.getTrendingPools();
   *
   * for (const pool of trending.pools) {
   *   console.log(`${pool.name}`);
   *   console.log(`FDV: ${pool.fdv}`);
   *   console.log(`24h Volume: ${pool.volume.h24}`);
   * }
   * ```
   */
  async getTrendingPools(options: TrendingOptions = {}): Promise<TrendingPoolsResponse> {
    const queryParams = new URLSearchParams();
    const chain = options.chain ?? this.defaultChain;

    if (chain) {
      queryParams.append('chain', chain);
    }
    if (options.limit !== undefined) {
      queryParams.append('limit', String(options.limit));
    }

    const queryString = queryParams.toString();
    const path = queryString ? `/tokens/pools/trending?${queryString}` : '/tokens/pools/trending';

    const response: HttpResponse<TrendingPoolsResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }
}
