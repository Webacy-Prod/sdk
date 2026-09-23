import { BaseResource, HttpResponse } from '@webacy-xyz/sdk-core';
import {
  LedgerFamily,
  LedgerScanRequest,
  LedgerEIP712Request,
  LedgerScanResponse,
  LedgerEIP712ScanResponse,
  LedgerScanOptions,
} from '../types';

/**
 * Resource for hardware wallet transaction scanning
 *
 * Provides security analysis for transactions before signing on
 * hardware wallets (Ledger devices). The responses carry the same
 * `simulation` payload as the `scan` resource plus the signed TLV
 * `descriptor` the device verifies.
 *
 * Note: This resource uses numeric chain IDs in the request body
 * rather than the Chain enum, as required by the underlying API.
 *
 * @example
 * ```typescript
 * // Scan a transaction before signing
 * const result = await client.ledger.scanTransaction('ethereum', {
 *   tx: { from: '0x...', raw: '0x...' },
 *   chain: 1,
 * });
 *
 * if (result.simulation.some((item) => (item.counterpartyRisk.high ?? 0) > 0)) {
 *   console.error('Transaction may be risky!');
 * }
 * ```
 */
// Note: Ledger uses numeric chain IDs in the request body rather than the
// Chain enum; the base constructor's optional defaultChain is unused here.
export class LedgerResource extends BaseResource {
  /**
   * Scan a transaction before signing
   *
   * Analyzes a transaction for security risks before signing
   * on a hardware wallet.
   *
   * @param family - Ledger device family (the API currently serves `ethereum`)
   * @param request - Transaction scan request
   * @param options - Request options
   * @returns Security analysis result
   *
   * @example
   * ```typescript
   * const result = await client.ledger.scanTransaction('ethereum', {
   *   tx: {
   *     from: '0xYourWallet...',
   *     raw: '0xEncodedTransaction...',
   *   },
   *   chain: 1, // Ethereum mainnet
   * });
   *
   * for (const item of result.simulation) {
   *   const { txData, counterpartyRisk } = item;
   *   console.log(`${txData.changeType} → ${txData.counterpartyAddress}`);
   *   if ((counterpartyRisk.high ?? 0) > 0) {
   *     console.warn('Flagged recipient:', counterpartyRisk.issues?.flatMap((i) => i.tags.map((t) => t.name)));
   *   }
   *   if (item.functionRisk) {
   *     console.log(`Risky function: ${item.functionRisk.functionName}`);
   *   }
   * }
   *
   * // The signed descriptor for the device
   * console.log(result.descriptor);
   * ```
   */
  async scanTransaction(
    family: LedgerFamily,
    request: LedgerScanRequest,
    options?: LedgerScanOptions
  ): Promise<LedgerScanResponse> {
    const path = this.buildPath(`/ledger/${family}/scan/tx`, {
      refreshCache: options?.refreshCache,
    });
    const response: HttpResponse<LedgerScanResponse> = await this.httpClient.post(
      path,
      request,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Scan EIP-712 typed data before signing
   *
   * Analyzes EIP-712 structured data for security risks
   * before signing on a hardware wallet.
   *
   * @param family - Ledger device family
   * @param request - EIP-712 scan request
   * @param options - Request options
   * @returns Security analysis result
   *
   * @example
   * ```typescript
   * const result = await client.ledger.scanEip712('ethereum', {
   *   msg: {
   *     from: '0xYourWallet...',
   *     data: {
   *       domain: {
   *         name: 'MyDApp',
   *         version: '1',
   *         chainId: 1,
   *         verifyingContract: '0x...',
   *       },
   *       message: {
   *         // Message content
   *       },
   *       primaryType: 'Order',
   *       types: {
   *         EIP712Domain: [
   *           { name: 'name', type: 'string' },
   *           // ...
   *         ],
   *         Order: [
   *           { name: 'maker', type: 'address' },
   *           // ...
   *         ],
   *       },
   *     },
   *   },
   *   domain: 'app.mydapp.com',
   * });
   *
   * if ((result.simulation.counterpartyRisk?.high ?? 0) > 0) {
   *   console.error('EIP-712 data may be risky!');
   * }
   * ```
   */
  async scanEip712(
    family: LedgerFamily,
    request: LedgerEIP712Request,
    options?: LedgerScanOptions
  ): Promise<LedgerEIP712ScanResponse> {
    const path = this.buildPath(`/ledger/${family}/scan/eip-712`, {
      refreshCache: options?.refreshCache,
    });
    const response: HttpResponse<LedgerEIP712ScanResponse> = await this.httpClient.post(
      path,
      request,
      this.requestOptions(options)
    );

    return response.data;
  }
}
