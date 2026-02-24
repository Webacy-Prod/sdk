import { BaseResource, HttpResponse, ValidationError } from '@webacy-xyz/sdk-core';
import {
  BatchContractsRequest,
  BatchContractsResponse,
  BatchAddressesRequest,
  BatchAddressesResponse,
  BatchTransactionsRequest,
  BatchTransactionsResponse,
  BatchOptions,
} from '../types/batch';

/**
 * Resource for batch risk analysis operations
 *
 * Provides batch endpoints for analyzing multiple entities in a single request:
 * - Batch contract risk analysis
 * - Batch address risk analysis
 * - Batch transaction risk analysis
 *
 * @example
 * ```typescript
 * // Batch analyze contracts
 * const results = await client.batch.contracts({
 *   addresses: ['0xContract1...', '0xContract2...'],
 *   chain: Chain.ETH,
 * });
 *
 * // Batch analyze addresses
 * const results = await client.batch.addresses({
 *   addresses: ['0xAddr1...', '0xAddr2...'],
 *   chain: Chain.ETH,
 * });
 *
 * // Batch analyze transactions
 * const results = await client.batch.transactions({
 *   transactions: ['0xTxHash1...', '0xTxHash2...'],
 *   chain: Chain.ETH,
 * });
 * ```
 */
export class BatchResource extends BaseResource {
  /**
   * Batch analyze contracts for risk
   *
   * @param request - Batch request with contract addresses and chain
   * @param options - Request options
   * @returns Batch contract analysis results
   */
  async contracts(
    request: BatchContractsRequest,
    options: BatchOptions = {}
  ): Promise<BatchContractsResponse> {
    this.validateBatchRequest(request.addresses, 'addresses');

    const response: HttpResponse<BatchContractsResponse> = await this.httpClient.post(
      '/query/contracts',
      request,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Batch analyze addresses for risk
   *
   * @param request - Batch request with addresses and chain
   * @param options - Request options
   * @returns Batch address analysis results
   */
  async addresses(
    request: BatchAddressesRequest,
    options: BatchOptions = {}
  ): Promise<BatchAddressesResponse> {
    this.validateBatchRequest(request.addresses, 'addresses');

    const response: HttpResponse<BatchAddressesResponse> = await this.httpClient.post(
      '/query/addresses',
      request,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  /**
   * Batch analyze transactions for risk
   *
   * @param request - Batch request with transaction hashes and chain
   * @param options - Request options
   * @returns Batch transaction analysis results
   */
  async transactions(
    request: BatchTransactionsRequest,
    options: BatchOptions = {}
  ): Promise<BatchTransactionsResponse> {
    this.validateBatchRequest(request.transactions, 'transactions');

    const response: HttpResponse<BatchTransactionsResponse> = await this.httpClient.post(
      '/batch/transactions',
      request,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }

  private validateBatchRequest(items: string[], fieldName: string): void {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError(`At least one item is required in the "${fieldName}" array.`);
    }
  }
}
