import { HttpResponse, BaseResource } from '@webacy-xyz/sdk-core';
import {
  VaultListResponse,
  VaultCursorListResponse,
  VaultDetailResponse,
  VaultListOptions,
  VaultCursorListOptions,
  VaultDetailOptions,
  VaultEventsResponse,
  VaultEventsOptions,
  VaultEventsForAddressOptions,
  VaultTvlHistoryResponse,
  VaultTvlHistoryOptions,
} from '../types';

/**
 * Resource for DeFi vault risk analysis
 *
 * Provides access to risk data for ERC-4626 vaults including risk scoring,
 * looping detection, TVL analysis, and underlying asset risk assessment.
 *
 * @example
 * ```typescript
 * // List all vaults
 * const vaults = await client.vaults.list();
 *
 * // Filter by protocol and risk tier
 * const morphoHigh = await client.vaults.list({
 *   protocol: 'morpho',
 *   tier: 'high',
 * });
 *
 * // Get detailed vault risk analysis
 * const detail = await client.vaults.get('0x...', { chain: Chain.ETH });
 * ```
 */
export class VaultsResource extends BaseResource {
  /**
   * List all rated ERC-4626 vaults with risk scores and aggregates
   *
   * Returns a paginated list of vaults using offset-based pagination.
   * For cursor-based pagination, use {@link listCursor}.
   *
   * @param options - Filter, sort, and pagination options
   * @returns Paginated vault list with aggregates
   *
   * @example
   * ```typescript
   * // Get all vaults
   * const result = await client.vaults.list();
   * console.log(`Total vaults: ${result.pagination.total}`);
   * console.log(`Total TVL: $${result.aggregates.total_tvl_usd}`);
   *
   * // Filter by protocol, chain, and risk
   * const risky = await client.vaults.list({
   *   protocol: 'morpho',
   *   chain: Chain.ETH,
   *   tier: 'high',
   *   sort: 'score_desc',
   * });
   *
   * // Filter by underlying asset and attention needed
   * const urgent = await client.vaults.list({
   *   underlying: 'USDC',
   *   attentionNeeded: true,
   * });
   *
   * // Search and filter by risk flags
   * const looping = await client.vaults.list({
   *   riskFlags: 'vault-high-looping,vault-upgradeable',
   *   riskFlagsMode: 'any',
   * });
   * ```
   */
  async list(options: VaultListOptions = {}): Promise<VaultListResponse> {
    const queryParams = new URLSearchParams();
    this.appendSharedListParams(queryParams, options);

    if (options.page !== undefined) queryParams.append('page', String(options.page));
    if (options.pageSize !== undefined) queryParams.append('pageSize', String(options.pageSize));

    const qs = queryParams.toString();
    const path = qs ? `/vaults?${qs}` : '/vaults';

    const response: HttpResponse<VaultListResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * List vaults with cursor-based pagination
   *
   * Returns vaults using an opaque cursor for efficient sequential pagination.
   * Pass the `next_cursor` from a previous response to get the next page.
   *
   * @param options - Filter options with required cursor
   * @returns Cursor-paginated vault list with aggregates
   *
   * @example
   * ```typescript
   * // First page
   * const first = await client.vaults.list({ pageSize: 100 });
   *
   * // Subsequent pages using cursor
   * const second = await client.vaults.listCursor({
   *   cursor: 'opaque-cursor-from-previous-response',
   *   limit: 100,
   * });
   *
   * if (second.next_cursor) {
   *   const third = await client.vaults.listCursor({
   *     cursor: second.next_cursor,
   *     limit: 100,
   *   });
   * }
   * ```
   */
  async listCursor(options: VaultCursorListOptions): Promise<VaultCursorListResponse> {
    const queryParams = new URLSearchParams();
    this.appendSharedListParams(queryParams, options);

    queryParams.append('cursor', options.cursor);
    if (options.limit !== undefined) queryParams.append('limit', String(options.limit));

    const path = `/vaults?${queryParams.toString()}`;

    const response: HttpResponse<VaultCursorListResponse> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * List curated historical vault incidents and attacks
   *
   * Returns the full catalog of curated vault incidents (exploits, rugs,
   * depegs, oracle attacks). To scope events to a single vault, use
   * {@link listEventsForAddress} instead. The endpoint degrades gracefully:
   * when the upstream curated source is unreachable the response is
   * `{ stale: true, events: [] }` rather than an error.
   *
   * @param options - Optional filters (category, mechanism)
   * @returns Curated vault events with generated-at metadata
   *
   * @example
   * ```typescript
   * // All curated events
   * const all = await client.vaults.listEvents();
   *
   * // Filter by category and mechanism
   * const oracleAttacks = await client.vaults.listEvents({
   *   category: VaultEventCategory.VAULT_CONTRACT,
   *   mechanism: VaultEventMechanism.ORACLE_MANIPULATION,
   * });
   * ```
   */
  async listEvents(options: VaultEventsOptions = {}): Promise<VaultEventsResponse> {
    const queryParams = new URLSearchParams();
    if (options.category !== undefined) queryParams.append('category', options.category);
    if (options.mechanism !== undefined) queryParams.append('mechanism', options.mechanism);

    const qs = queryParams.toString();
    const path = qs ? `/vaults/events?${qs}` : '/vaults/events';

    const response: HttpResponse<Partial<VaultEventsResponse>> = await this.httpClient.get(path, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return this.normalizeEventsResponse(response.data);
  }

  /**
   * List curated historical incidents for a specific vault
   *
   * Returns the curated incident catalog scoped to a single vault. Like
   * {@link listEvents}, the endpoint degrades gracefully when the upstream
   * source is unreachable (`{ stale: true, events: [] }`).
   *
   * @param address - Vault contract address
   * @param options - Query options (chain is required)
   * @returns Curated vault events scoped to the given vault
   *
   * @example
   * ```typescript
   * // All curated events for a vault
   * const events = await client.vaults.listEventsForAddress('0xabc...', {
   *   chain: Chain.ETH,
   * });
   *
   * // Filter by category
   * const contractIssues = await client.vaults.listEventsForAddress('0xabc...', {
   *   chain: Chain.ETH,
   *   category: VaultEventCategory.VAULT_CONTRACT,
   * });
   * ```
   */
  async listEventsForAddress(
    address: string,
    options: VaultEventsForAddressOptions
  ): Promise<VaultEventsResponse> {
    const chain = options.chain;
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);
    if (options.category !== undefined) queryParams.append('category', options.category);
    if (options.mechanism !== undefined) queryParams.append('mechanism', options.mechanism);

    const response: HttpResponse<Partial<VaultEventsResponse>> = await this.httpClient.get(
      `/vaults/${encodeURIComponent(address)}/events?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return this.normalizeEventsResponse(response.data);
  }

  /**
   * Fill defaults for the degraded `{ stale: true, events: [] }` response
   * shape so callers always receive a conforming VaultEventsResponse.
   */
  private normalizeEventsResponse(data: Partial<VaultEventsResponse>): VaultEventsResponse {
    const events = data.events ?? [];
    return {
      generated_at: data.generated_at ?? null,
      stale: data.stale ?? false,
      count: data.count ?? events.length,
      events,
    };
  }

  /**
   * Get detailed risk data for a specific vault
   *
   * Returns comprehensive vault detail including metadata, risk breakdown,
   * looping markets, composition, Morpho-specific data, and Webacy findings.
   *
   * @param address - Vault contract address
   * @param options - Query options (chain is required)
   * @returns Detailed vault risk data
   *
   * @example
   * ```typescript
   * const detail = await client.vaults.get('0x...', { chain: Chain.ETH });
   *
   * console.log(`Score: ${detail.risk.score}`);
   * console.log(`TVL: $${detail.metadata.tvl_usd}`);
   * console.log(`Protocol: ${detail.metadata.protocol}`);
   * console.log(`Listing verdict: ${detail.metadata.listing_verdict}`);
   *
   * // Check Morpho-specific data
   * if (detail.morpho) {
   *   console.log(`Morpho liquidity: $${detail.morpho.liquidity_usd}`);
   * }
   *
   * // Check risk issues
   * for (const issue of detail.risk.issues) {
   *   console.log(`Risk score: ${issue.score}, tags: ${issue.tags.join(', ')}`);
   * }
   * ```
   */
  async get(address: string, options: VaultDetailOptions): Promise<VaultDetailResponse> {
    const chain = options.chain;
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    const response: HttpResponse<VaultDetailResponse> = await this.httpClient.get(
      `/vaults/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Get the daily TVL history for a specific vault
   *
   * Returns a daily time series of total value locked (USD) for the vault,
   * along with a hoisted `latest` aggregate so stat-tile consumers can render
   * the current value without requesting the full series. `stale` flips
   * `true` when the latest sample is older than 48h or the series is empty.
   *
   * @param address - Vault contract address
   * @param options - Query options (chain is required; range optional, defaults to `30d`)
   * @returns Daily TVL series with envelope and latest aggregate
   *
   * @example
   * ```typescript
   * // Default 30-day window
   * const history = await client.vaults.getTvlHistory('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * if (history.latest) {
   *   console.log(`Current TVL: $${history.latest.tvl_usd}`);
   * }
   *
   * // 7-day window
   * const week = await client.vaults.getTvlHistory('0x...', {
   *   chain: Chain.ETH,
   *   range: '7d',
   * });
   * ```
   */
  async getTvlHistory(
    address: string,
    options: VaultTvlHistoryOptions
  ): Promise<VaultTvlHistoryResponse> {
    const chain = options.chain;
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);
    if (options.range !== undefined) queryParams.append('range', options.range);

    const response: HttpResponse<VaultTvlHistoryResponse> = await this.httpClient.get(
      `/vaults/${encodeURIComponent(address)}/tvl-history?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /** Append filter params shared between offset and cursor list methods */
  private appendSharedListParams(queryParams: URLSearchParams, options: VaultListOptions): void {
    if (options.chain) queryParams.append('chain', options.chain);
    if (options.tier !== undefined) queryParams.append('tier', options.tier);
    if (options.underlying !== undefined) queryParams.append('underlying', options.underlying);
    if (options.protocol !== undefined) queryParams.append('protocol', options.protocol);
    if (options.minTvl !== undefined) queryParams.append('minTvl', String(options.minTvl));
    if (options.underlyingRisk !== undefined)
      queryParams.append('underlyingRisk', options.underlyingRisk);
    if (options.minScore !== undefined) queryParams.append('minScore', String(options.minScore));
    if (options.maxScore !== undefined) queryParams.append('maxScore', String(options.maxScore));
    if (options.contractType !== undefined)
      queryParams.append('contractType', options.contractType);
    if (options.attentionNeeded !== undefined)
      queryParams.append('attentionNeeded', String(options.attentionNeeded));
    if (options.riskFlags !== undefined) queryParams.append('riskFlags', options.riskFlags);
    if (options.riskFlagsMode !== undefined)
      queryParams.append('riskFlagsMode', options.riskFlagsMode);
    if (options.q !== undefined) queryParams.append('q', options.q);
    if (options.sort !== undefined) queryParams.append('sort', options.sort);
  }
}
