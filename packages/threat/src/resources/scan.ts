import { BaseResource, HttpResponse, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import {
  ScanTransactionRequest,
  ScanEip712Request,
  ScanResponse,
  ScanEip712Response,
  ScanOptions,
} from '../types/scan';
import { VALID_SCAN_CHAIN_IDS } from '../constants';

/**
 * Resource for transaction and message scanning
 *
 * Provides pre-signing security analysis for:
 * - Raw transaction scanning
 * - EIP-712 typed message scanning
 *
 * Note: This resource uses numeric chain IDs (1, 56, 137, etc.) in the request body
 * rather than the Chain enum, as required by the underlying API.
 *
 * @example
 * ```typescript
 * // Scan a transaction before signing
 * const result = await client.scan.scanTransaction('0xSigner', {
 *   tx: { from: '0xSigner', raw: '0xRawTx...' },
 *   chain: 1, // Ethereum
 * });
 *
 * // Scan an EIP-712 message
 * const result = await client.scan.scanEip712('0xSigner', {
 *   msg: {
 *     from: '0xSigner',
 *     data: { types: {...}, primaryType: 'Permit', domain: {...}, message: {...} },
 *   },
 * });
 * ```
 */
export class ScanResource extends BaseResource {
  // Note: Scan uses numeric chain IDs in request body, defaultChain is accepted for consistency
  constructor(httpClient: import('@webacy-xyz/sdk-core').HttpClient, _defaultChain?: Chain) {
    super(httpClient, _defaultChain);
  }

  /**
   * Scan a transaction for security risks before signing
   *
   * Analyzes raw transaction data and returns:
   * - Risk assessment and warnings
   * - Simulated asset changes
   * - Contract interaction details
   * - Domain reputation (if provided)
   *
   * @param fromAddress - The signer address
   * @param request - Transaction scan request
   * @param options - Request options
   * @returns Transaction scan result
   *
   * @example
   * ```typescript
   * const result = await client.scan.scanTransaction('0xSigner...', {
   *   tx: {
   *     from: '0xSigner...',
   *     raw: '0x02f8...',
   *   },
   *   chain: 1, // Ethereum mainnet
   *   domain: 'uniswap.org',
   * });
   *
   * if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
   *   console.warn('High risk transaction!');
   *   for (const warning of result.warnings) {
   *     console.warn(`${warning.severity}: ${warning.description}`);
   *   }
   * }
   *
   * // Check simulated asset changes
   * if (result.assetChanges) {
   *   for (const change of result.assetChanges) {
   *     console.log(`${change.type}: ${change.amount} ${change.symbol}`);
   *   }
   * }
   * ```
   */
  async scanTransaction(
    fromAddress: string,
    request: ScanTransactionRequest,
    options: ScanOptions = {}
  ): Promise<ScanResponse> {
    this.validateSignerAddress(fromAddress);
    this.validateTransactionRequest(request);

    const queryParams = new URLSearchParams();
    if (options.refreshCache !== undefined) {
      queryParams.append('refreshCache', String(options.refreshCache));
    }

    const queryString = queryParams.toString();
    const path = `/scan/${encodeURIComponent(fromAddress)}/transactions${queryString ? `?${queryString}` : ''}`;

    const response: HttpResponse<ScanResponse> = await this.httpClient.post(path, request, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * Scan an EIP-712 typed message for security risks before signing
   *
   * Analyzes EIP-712 typed data and returns:
   * - Risk assessment and warnings
   * - Message type analysis (permit, order, etc.)
   * - Spender analysis for approvals
   * - Domain reputation (if provided)
   *
   * @param fromAddress - The signer address
   * @param request - EIP-712 scan request
   * @param options - Request options
   * @returns EIP-712 scan result
   *
   * @example
   * ```typescript
   * const result = await client.scan.scanEip712('0xSigner...', {
   *   msg: {
   *     from: '0xSigner...',
   *     data: {
   *       types: {
   *         EIP712Domain: [
   *           { name: 'name', type: 'string' },
   *           { name: 'version', type: 'string' },
   *           { name: 'chainId', type: 'uint256' },
   *           { name: 'verifyingContract', type: 'address' },
   *         ],
   *         Permit: [
   *           { name: 'owner', type: 'address' },
   *           { name: 'spender', type: 'address' },
   *           { name: 'value', type: 'uint256' },
   *           { name: 'nonce', type: 'uint256' },
   *           { name: 'deadline', type: 'uint256' },
   *         ],
   *       },
   *       primaryType: 'Permit',
   *       domain: {
   *         name: 'Token',
   *         version: '1',
   *         chainId: 1,
   *         verifyingContract: '0xToken...',
   *       },
   *       message: {
   *         owner: '0xSigner...',
   *         spender: '0xSpender...',
   *         value: '1000000000000000000',
   *         nonce: 0,
   *         deadline: 1735689600,
   *       },
   *     },
   *   },
   *   domain: 'app.uniswap.org',
   * });
   *
   * if (result.messageType?.isPermit) {
   *   console.log('This is a permit/approval signature');
   *   if (result.spenderAnalysis?.riskLevel === 'high') {
   *     console.warn('High risk spender!');
   *   }
   * }
   * ```
   */
  async scanEip712(
    fromAddress: string,
    request: ScanEip712Request,
    options: ScanOptions = {}
  ): Promise<ScanEip712Response> {
    this.validateSignerAddress(fromAddress);
    this.validateEip712Request(request);

    const queryParams = new URLSearchParams();
    if (options.refreshCache !== undefined) {
      queryParams.append('refreshCache', String(options.refreshCache));
    }

    const queryString = queryParams.toString();
    const path = `/scan/${encodeURIComponent(fromAddress)}/eip712${queryString ? `?${queryString}` : ''}`;

    const response: HttpResponse<ScanEip712Response> = await this.httpClient.post(path, request, {
      timeout: options.timeout,
      signal: options.signal,
    });

    return response.data;
  }

  /**
   * Validate signer address format (basic non-empty check)
   *
   * Note: This is a simpler validation than the chain-aware validation in BaseResource,
   * as scan requests accept EVM addresses only.
   */
  private validateSignerAddress(address: string): void {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new ValidationError('Address is required and must be a non-empty string.');
    }
  }

  /**
   * Validate transaction scan request
   */
  private validateTransactionRequest(request: ScanTransactionRequest): void {
    if (!request) {
      throw new ValidationError('Request body is required.');
    }
    if (!request.tx) {
      throw new ValidationError('Transaction data (tx) is required.');
    }
    if (!request.tx.from || typeof request.tx.from !== 'string') {
      throw new ValidationError('Transaction from address (tx.from) is required.');
    }
    if (!request.tx.raw || typeof request.tx.raw !== 'string') {
      throw new ValidationError('Raw transaction data (tx.raw) is required.');
    }
    if (!VALID_SCAN_CHAIN_IDS.includes(request.chain)) {
      throw new ValidationError(
        `Invalid chain ID. Supported chain IDs: ${VALID_SCAN_CHAIN_IDS.join(', ')} (1=ETH, 56=BSC, 137=POL, 10=OPT, 42161=ARB, 8453=BASE)`
      );
    }
  }

  /**
   * Validate EIP-712 scan request
   */
  private validateEip712Request(request: ScanEip712Request): void {
    if (!request) {
      throw new ValidationError('Request body is required.');
    }
    if (!request.msg) {
      throw new ValidationError('Message data (msg) is required.');
    }
    if (!request.msg.from || typeof request.msg.from !== 'string') {
      throw new ValidationError('Message from address (msg.from) is required.');
    }
    if (!request.msg.data) {
      throw new ValidationError('EIP-712 typed data (msg.data) is required.');
    }
    if (!request.msg.data.types || typeof request.msg.data.types !== 'object') {
      throw new ValidationError('EIP-712 types (msg.data.types) is required.');
    }
    if (!request.msg.data.primaryType || typeof request.msg.data.primaryType !== 'string') {
      throw new ValidationError('EIP-712 primaryType (msg.data.primaryType) is required.');
    }
    if (!request.msg.data.domain || typeof request.msg.data.domain !== 'object') {
      throw new ValidationError('EIP-712 domain (msg.data.domain) is required.');
    }
    if (typeof request.msg.data.domain.chainId !== 'number') {
      throw new ValidationError('EIP-712 domain chainId (msg.data.domain.chainId) is required.');
    }
    if (request.msg.data.domain.chainId <= 0) {
      throw new ValidationError('EIP-712 domain chainId must be a positive integer.');
    }
    if (!request.msg.data.message || typeof request.msg.data.message !== 'object') {
      throw new ValidationError('EIP-712 message (msg.data.message) is required.');
    }
    if (Object.keys(request.msg.data.message).length === 0) {
      throw new ValidationError('EIP-712 message (msg.data.message) cannot be empty.');
    }
  }
}
