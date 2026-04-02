import { HttpResponse, BaseResource } from '@webacy-xyz/sdk-core';
import {
  RwaTokenListResponse,
  RwaTokenDetailResponse,
  RwaListOptions,
  RwaDetailOptions,
} from '../types';

/**
 * Resource for RWA (Real World Assets) depeg risk monitoring
 *
 * Provides access to depeg risk data for pegged tokens including stablecoins,
 * tokenized gold, yield-bearing tokens, and bridged assets.
 *
 * @example
 * ```typescript
 * // List all pegged tokens
 * const tokens = await client.rwa.list();
 *
 * // Filter by chain and risk tier
 * const critical = await client.rwa.list({
 *   chain: Chain.ETH,
 *   tier: 'critical',
 * });
 *
 * // Get detailed depeg risk for a specific token
 * const detail = await client.rwa.get('0x...', {
 *   chain: Chain.ETH,
 *   hours: 72,
 * });
 * ```
 */
export class RwaResource extends BaseResource {
  /**
   * List all pegged tokens with depeg risk data and aggregates
   *
   * Returns a paginated list of tracked pegged tokens with their current
   * depeg risk scores, price deviations, liquidity data, and ecosystem-wide
   * aggregates.
   *
   * @param options - Filter, sort, and pagination options
   * @returns Paginated token list with aggregates
   *
   * @example
   * ```typescript
   * // Get all tokens
   * const result = await client.rwa.list();
   * console.log(`Total tokens: ${result.pagination.total}`);
   * console.log(`Stability index: ${result.aggregates.stability_index}`);
   *
   * // Filter by denomination and risk
   * const usdCritical = await client.rwa.list({
   *   denomination: 'USD',
   *   tier: 'critical',
   *   sort: 'score',
   *   order: 'desc',
   * });
   *
   * // Search and filter by tags
   * const goldTokens = await client.rwa.list({
   *   tags: ['gold', 'rwa'],
   *   minMcap: 1_000_000,
   * });
   *
   * // View collapsed/dead tokens
   * const graveyard = await client.rwa.list({ collapsedOnly: true });
   * ```
   */
  async list(options: RwaListOptions = {}): Promise<RwaTokenListResponse> {
    const queryParams = new URLSearchParams();

    if (options.chain) queryParams.append('chain', options.chain);
    if (options.denomination !== undefined)
      queryParams.append('denomination', options.denomination);
    if (options.tier !== undefined) queryParams.append('tier', options.tier);
    if (options.tags && options.tags.length > 0) queryParams.append('tags', options.tags.join(','));
    if (options.minScore !== undefined) queryParams.append('minScore', String(options.minScore));
    if (options.maxScore !== undefined) queryParams.append('maxScore', String(options.maxScore));
    if (options.minMcap !== undefined) queryParams.append('minMcap', String(options.minMcap));
    if (options.liquidity !== undefined) queryParams.append('liquidity', options.liquidity);
    if (options.q !== undefined) queryParams.append('q', options.q);
    if (options.sort !== undefined) queryParams.append('sort', options.sort);
    if (options.order !== undefined) queryParams.append('order', options.order);
    if (options.showAll !== undefined) queryParams.append('showAll', String(options.showAll));
    if (options.collapsedOnly !== undefined)
      queryParams.append('collapsedOnly', String(options.collapsedOnly));
    if (options.page !== undefined) queryParams.append('page', String(options.page));
    if (options.pageSize !== undefined) queryParams.append('pageSize', String(options.pageSize));

    const qs = queryParams.toString();
    const path = qs ? `/rwa?${qs}` : '/rwa';

    const response: HttpResponse<RwaTokenListResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * Get detailed depeg risk data for a specific pegged token
   *
   * Returns comprehensive token detail including identity, current snapshot,
   * risk analysis, historical time series, and depeg events.
   *
   * @param address - Token contract address
   * @param options - Query options (chain, hours of history)
   * @returns Detailed token data with history and events
   *
   * @example
   * ```typescript
   * // Get token detail with default 24h history
   * const detail = await client.rwa.get('0xA0b8...');
   *
   * // Specify chain and request 7 days of history
   * const detail = await client.rwa.get('0xA0b8...', {
   *   chain: Chain.ETH,
   *   hours: 168,
   * });
   *
   * console.log(`Score: ${detail.snapshot.score}`);
   * console.log(`Tier: ${detail.snapshot.tier}`);
   * console.log(`History points: ${detail.history.series.length}`);
   * console.log(`Depeg events: ${detail.depegEvents.length}`);
   * ```
   */
  async get(address: string, options: RwaDetailOptions = {}): Promise<RwaTokenDetailResponse> {
    const queryParams = new URLSearchParams();

    if (options.chain) queryParams.append('chain', options.chain);
    if (options.hours !== undefined) queryParams.append('hours', String(options.hours));

    const qs = queryParams.toString();
    const path = qs
      ? `/rwa/${encodeURIComponent(address)}?${qs}`
      : `/rwa/${encodeURIComponent(address)}`;

    const response: HttpResponse<RwaTokenDetailResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }
}
