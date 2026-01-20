import { HttpResponse, BaseResource, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import {
  PoolsResponse,
  TrendingTokensResponse,
  TrendingPoolsResponse,
  TokenPoolsOptions,
  TrendingOptions,
  TokenEconomicsResponse,
  TokenEconomicsOptions,
  PoolOhlcvResponse,
  PoolOhlcvOptions,
  OhlcvTimeFrame,
} from '../types';
import { SUPPORTED_TOKEN_ECONOMICS_CHAINS, VALID_TIME_FRAMES } from '../constants';

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

  /**
   * Get token economics data
   *
   * Returns token economics metrics for a specific date including
   * supply, market cap, price, volume, and holder statistics.
   *
   * @param address - Token address
   * @param options - Request options (chain and metricsDate required)
   * @returns Token economics data
   *
   * @example
   * ```typescript
   * const token = await client.tokens.getToken('0x...', {
   *   chain: Chain.ETH,
   *   metricsDate: '15-01-2024', // DD-MM-YYYY
   * });
   *
   * console.log(`Token: ${token.name} (${token.symbol})`);
   * console.log(`Price: $${token.metrics.priceUsd}`);
   * console.log(`Market Cap: $${token.metrics.marketCap}`);
   * console.log(`24h Volume: $${token.metrics.volume24h}`);
   * console.log(`Holders: ${token.metrics.holderCount}`);
   * ```
   */
  async getToken(address: string, options: TokenEconomicsOptions): Promise<TokenEconomicsResponse> {
    const { chain, metricsDate } = options;
    this.validateTokenEconomicsChain(chain);
    this.validateAddress(address, chain);
    this.validateMetricsDate(metricsDate);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);
    queryParams.append('metrics-date', metricsDate);

    const response: HttpResponse<TokenEconomicsResponse> = await this.httpClient.get(
      `/tokens/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get pool OHLCV data
   *
   * Returns Open, High, Low, Close, Volume data for a liquidity pool
   * at the specified time frame.
   *
   * @param poolAddress - Pool address
   * @param options - Request options
   * @returns Pool OHLCV data
   *
   * @example
   * ```typescript
   * // Get hourly OHLCV data
   * const ohlcv = await client.tokens.getPoolOhlcv('0xPoolAddress', {
   *   chain: Chain.ETH,
   *   timeFrame: 'hour',
   *   limit: 24, // Last 24 hours
   * });
   *
   * console.log(`Pool: ${ohlcv.poolName}`);
   * for (const candle of ohlcv.data) {
   *   console.log(`${new Date(candle.timestamp * 1000).toISOString()}`);
   *   console.log(`  O: ${candle.open} H: ${candle.high} L: ${candle.low} C: ${candle.close}`);
   *   console.log(`  Volume: ${candle.volume}`);
   * }
   *
   * // Get data before a specific timestamp
   * const historical = await client.tokens.getPoolOhlcv('0xPoolAddress', {
   *   chain: Chain.ETH,
   *   timeFrame: 'day',
   *   beforeTimestamp: 1705363200, // Unix timestamp
   *   limit: 30,
   * });
   * ```
   */
  async getPoolOhlcv(poolAddress: string, options: PoolOhlcvOptions): Promise<PoolOhlcvResponse> {
    const { chain, timeFrame } = options;
    this.validateTokenEconomicsChain(chain);
    this.validateAddress(poolAddress, chain);
    this.validateTimeFrame(timeFrame);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);
    queryParams.append('timeFrame', timeFrame);

    if (options.beforeTimestamp !== undefined) {
      queryParams.append('beforeTimestamp', String(options.beforeTimestamp));
    }
    if (options.limit !== undefined) {
      queryParams.append('limit', String(options.limit));
    }

    const response: HttpResponse<PoolOhlcvResponse> = await this.httpClient.get(
      `/tokens/pools/${encodeURIComponent(poolAddress)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Validate chain is supported for token economics
   */
  private validateTokenEconomicsChain(chain: Chain): void {
    if (!SUPPORTED_TOKEN_ECONOMICS_CHAINS.includes(chain)) {
      throw new ValidationError(
        `Chain "${chain}" is not supported for token economics. Supported chains: ${SUPPORTED_TOKEN_ECONOMICS_CHAINS.join(', ')}`
      );
    }
  }

  /**
   * Validate metrics date format (DD-MM-YYYY) and that it's a valid date
   */
  private validateMetricsDate(date: string): void {
    if (!date || typeof date !== 'string') {
      throw new ValidationError('Metrics date is required.');
    }
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateRegex.exec(date);
    if (!match) {
      throw new ValidationError('Metrics date must be in DD-MM-YYYY format (e.g., "15-01-2024").');
    }

    const [, dayStr, monthStr, yearStr] = match;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Validate month range
    if (month < 1 || month > 12) {
      throw new ValidationError(`Invalid month "${monthStr}". Month must be between 01 and 12.`);
    }

    // Validate day range (basic check)
    if (day < 1 || day > 31) {
      throw new ValidationError(`Invalid day "${dayStr}". Day must be between 01 and 31.`);
    }

    // Validate actual date (handles leap years, month lengths)
    const parsedDate = new Date(year, month - 1, day);
    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      throw new ValidationError(`Invalid date "${date}". This date does not exist.`);
    }
  }

  /**
   * Validate time frame
   */
  private validateTimeFrame(timeFrame: OhlcvTimeFrame): void {
    if (!VALID_TIME_FRAMES.includes(timeFrame)) {
      throw new ValidationError(
        `Invalid time frame "${timeFrame}". Valid time frames: ${VALID_TIME_FRAMES.join(', ')}`
      );
    }
  }
}
