import { HttpClient, HttpResponse } from '@webacy/sdk-core';
import {
  LedgerFamily,
  LedgerScanRequest,
  LedgerEIP712Request,
  LedgerScanResponse,
  LedgerScanOptions,
} from '../types';

/**
 * Resource for hardware wallet transaction scanning
 *
 * Provides security analysis for transactions before signing on
 * hardware wallets (Ledger devices).
 *
 * @example
 * ```typescript
 * // Scan a transaction before signing
 * const result = await client.ledger.scanTransaction('ethereum', {
 *   tx: { from: '0x...', raw: '0x...' },
 *   chain: 1,
 * });
 *
 * if (!result.is_safe) {
 *   console.error('Transaction may be risky!');
 * }
 * ```
 */
export class LedgerResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Scan a transaction before signing
   *
   * Analyzes a transaction for security risks before signing
   * on a hardware wallet.
   *
   * @param family - Ledger device family (ethereum, solana, bitcoin)
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
   * if (!result.is_safe) {
   *   console.error(`Risk level: ${result.risk_level}`);
   *   for (const risk of result.risks) {
   *     console.warn(`${risk.level}: ${risk.description}`);
   *   }
   * }
   *
   * // Check decoded data
   * if (result.decoded?.function_name) {
   *   console.log(`Function: ${result.decoded.function_name}`);
   * }
   * ```
   */
  async scanTransaction(
    family: LedgerFamily,
    request: LedgerScanRequest,
    options?: LedgerScanOptions
  ): Promise<LedgerScanResponse> {
    const response: HttpResponse<LedgerScanResponse> = await this.httpClient.post(
      `/ledger/${family}/scan/tx`,
      request,
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
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
   *   signer: '0xYourWallet...',
   *   typedData: {
   *     domain: {
   *       name: 'MyDApp',
   *       version: '1',
   *       chainId: 1,
   *       verifyingContract: '0x...',
   *     },
   *     message: {
   *       // Message content
   *     },
   *     primaryType: 'Order',
   *     types: {
   *       EIP712Domain: [
   *         { name: 'name', type: 'string' },
   *         // ...
   *       ],
   *       Order: [
   *         { name: 'maker', type: 'address' },
   *         // ...
   *       ],
   *     },
   *   },
   *   chain: 1,
   * });
   *
   * if (!result.is_safe) {
   *   console.error('EIP-712 data may be risky!');
   * }
   * ```
   */
  async scanEip712(
    family: LedgerFamily,
    request: LedgerEIP712Request,
    options?: LedgerScanOptions
  ): Promise<LedgerScanResponse> {
    const response: HttpResponse<LedgerScanResponse> = await this.httpClient.post(
      `/ledger/${family}/scan/eip-712`,
      request,
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }
}
