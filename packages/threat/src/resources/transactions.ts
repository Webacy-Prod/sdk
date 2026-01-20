import { HttpClient, HttpResponse, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import { TransactionRiskResponse, TransactionOptions } from '../types/transaction';

/**
 * Supported chains for transaction analysis
 */
const SUPPORTED_TX_CHAINS: Chain[] = [
  Chain.ETH,
  Chain.BASE,
  Chain.BSC,
  Chain.POL,
  Chain.OPT,
  Chain.ARB,
  Chain.SOL,
  Chain.STELLAR,
];

/**
 * Resource for transaction risk analysis
 *
 * Provides security analysis for blockchain transactions including:
 * - Risk scoring
 * - Risk categorization and tagging
 * - Transaction details analysis
 *
 * @example
 * ```typescript
 * // Analyze a transaction
 * const risk = await client.transactions.analyze('0x...txhash', { chain: Chain.ETH });
 *
 * // Hide trust flags
 * const risk = await client.transactions.analyze('0x...txhash', {
 *   chain: Chain.ETH,
 *   hideTrustFlags: true,
 * });
 * ```
 */
export class TransactionsResource {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly defaultChain?: Chain
  ) {}

  /**
   * Analyze a transaction for security risks
   *
   * Returns comprehensive risk analysis including:
   * - Risk score (0-100)
   * - Risk tags and categories
   * - Transaction details
   *
   * @param txHash - Transaction hash to analyze
   * @param options - Analysis options
   * @returns Transaction risk analysis result
   *
   * @example
   * ```typescript
   * const risk = await client.transactions.analyze('0xabc123...', {
   *   chain: Chain.ETH,
   * });
   * console.log(`Risk score: ${risk.riskScore}`);
   *
   * // With default chain configured
   * const risk = await client.transactions.analyze('0xabc123...');
   *
   * // Hide trust flags in response
   * const risk = await client.transactions.analyze('0xabc123...', {
   *   chain: Chain.ETH,
   *   hideTrustFlags: true,
   * });
   * ```
   */
  async analyze(
    txHash: string,
    options: TransactionOptions = {}
  ): Promise<TransactionRiskResponse> {
    const chain = this.resolveChain(options);
    this.validateChain(chain);
    this.validateTxHash(txHash);

    const queryParams = new URLSearchParams();
    queryParams.append('chain', chain);

    if (options.hideTrustFlags !== undefined) {
      queryParams.append('hide_trust_flags', String(options.hideTrustFlags));
    }

    const response: HttpResponse<TransactionRiskResponse> = await this.httpClient.get(
      `/transactions/${encodeURIComponent(txHash)}?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Resolve the chain to use for a request
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
   * Validate that the chain is supported for transaction analysis
   */
  private validateChain(chain: Chain): void {
    if (!SUPPORTED_TX_CHAINS.includes(chain)) {
      throw new ValidationError(
        `Chain "${chain}" is not supported for transaction analysis. Supported chains: ${SUPPORTED_TX_CHAINS.join(', ')}`
      );
    }
  }

  /**
   * Validate transaction hash format
   */
  private validateTxHash(txHash: string): void {
    if (!txHash || typeof txHash !== 'string' || txHash.trim() === '') {
      throw new ValidationError('Transaction hash is required and must be a non-empty string.');
    }
  }
}
