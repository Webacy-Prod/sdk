import { HttpResponse, BaseResource } from '@webacy/sdk-core';
import { AccountTraceResponse, AccountTraceOptions } from '../types';

/**
 * Resource for account fund flow tracing
 *
 * Traces fund flows to and from addresses to identify
 * connections to risky entities.
 *
 * @example
 * ```typescript
 * const trace = await client.accountTrace.trace('0x...', { chain: Chain.ETH });
 * console.log(`Sanctioned connections: ${trace.summary.sanctioned_connections}`);
 *
 * // With default chain configured, chain can be omitted
 * const client = new ThreatClient({ apiKey: '...', defaultChain: Chain.ETH });
 * const trace = await client.accountTrace.trace('0x...'); // Uses ETH
 * ```
 */
export class AccountTraceResource extends BaseResource {
  /**
   * Trace account fund flows
   *
   * Analyzes connections to identify:
   * - Direct counterparties
   * - Sanctioned address connections
   * - Mixer usage
   * - High-risk entities
   *
   * @param address - Address to trace
   * @param options - Trace options (chain is optional if defaultChain is set)
   * @returns Fund flow trace result
   *
   * @example
   * ```typescript
   * const trace = await client.accountTrace.trace('0x...', {
   *   chain: Chain.ETH,
   *   depth: 2, // Trace 2 hops
   * });
   *
   * // With default chain configured
   * const trace = await client.accountTrace.trace('0x...');
   *
   * console.log(`Total connections: ${trace.summary.total_connections}`);
   * console.log(`High risk: ${trace.summary.high_risk_connections}`);
   * console.log(`Sanctioned: ${trace.summary.sanctioned_connections}`);
   * console.log(`Mixers: ${trace.summary.mixer_connections}`);
   *
   * // Check individual connections
   * for (const conn of trace.connections) {
   *   if (conn.risk_flags?.length) {
   *     console.warn(`Risky connection: ${conn.address}`);
   *     console.warn(`Flags: ${conn.risk_flags.join(', ')}`);
   *   }
   * }
   * ```
   */
  async trace(address: string, options: AccountTraceOptions = {}): Promise<AccountTraceResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.depth !== undefined) {
      queryParams.append('depth', String(options.depth));
    }

    const response: HttpResponse<AccountTraceResponse> = await this.httpClient.get(
      `/account-trace/${encodeURIComponent(address)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }
}
