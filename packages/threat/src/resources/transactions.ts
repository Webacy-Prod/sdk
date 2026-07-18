import { BaseResource, HttpResponse, ValidationError } from '@webacy-xyz/sdk-core';
import { TransactionRiskResponse, TransactionOptions } from '../types/transaction';
import { SUPPORTED_TX_CHAINS } from '../constants';

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
export class TransactionsResource extends BaseResource {
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
    const chain = this.resolveChain(options, SUPPORTED_TX_CHAINS, 'transaction analysis');
    this.validateTxHash(txHash);

    const path = this.buildPath(`/transactions/${encodeURIComponent(txHash)}`, {
      chain,
      hide_trust_flags: options.hideTrustFlags,
    });

    const response: HttpResponse<TransactionRiskResponse> = await this.httpClient.get(
      path,
      this.requestOptions(options)
    );

    return response.data;
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
