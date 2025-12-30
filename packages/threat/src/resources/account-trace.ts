import {
  HttpClient,
  HttpResponse,
  ValidationError,
  isValidAddress,
  CHAIN_NAMES,
  Chain,
} from '@webacy/sdk-core';
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
export class AccountTraceResource {
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
  async trace(
    address: string,
    options: AccountTraceOptions = {}
  ): Promise<AccountTraceResponse> {
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
