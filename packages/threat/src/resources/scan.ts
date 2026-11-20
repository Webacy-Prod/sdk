import { BaseResource, HttpResponse, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import {
  ScanTransactionRequest,
  ScanSolanaTransactionRequest,
  ScanEIP712Request,
  ScanResponse,
  ScanSolanaResponse,
  ScanEIP712Response,
  ScanOptions,
  ScanChainId,
  RiskScanOptions,
  RiskScanResponse,
  RiskScanStatusResponse,
} from '../types/scan';
import { VALID_SCAN_CHAIN_IDS } from '../constants';

/** Standard base64 (what `Buffer#toString('base64')` and `@solana/web3.js` emit) */
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Resource for transaction and message scanning
 *
 * Provides pre-signing security analysis for:
 * - Raw transaction scanning
 * - EIP-712 typed message scanning
 *
 * Note: This resource uses numeric chain IDs (1, 56, 137, etc.) in the request body
 * rather than the Chain enum, as required by the underlying API. Solana, which has
 * no numeric id, is the slug `chain: 'sol'` (behind a server-side flag, not
 * enabled for customers yet).
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
   * Simulates the serialized unsigned transaction (`tx.raw`, e.g. ethers
   * `Transaction.from({...}).unsignedSerialized`) and returns one `simulation`
   * item per asset movement / approval, each with the risk profile of the
   * signer (`partyRisk`), the recipient or spender (`counterpartyRisk`) and
   * the token (`assetRisk`), plus a `functionRisk` when the calldata calls a
   * known-risky function and the signed TLV `descriptor`.
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
   * for (const item of result.simulation) {
   *   const { txData, counterpartyRisk, assetRisk } = item;
   *   console.log(`${txData.changeType} ${txData.rawAmount ?? ''} ${txData.symbol ?? txData.assetType} → ${txData.counterpartyAddress}`);
   *   if ((counterpartyRisk.high ?? 0) > 0 || (assetRisk.high ?? 0) > 0) {
   *     console.warn('High risk transaction!', counterpartyRisk.issues?.flatMap((i) => i.tags.map((t) => t.name)));
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Solana (behind a server-side flag, not enabled for customers yet: until
   * // it is, the API answers 400 "Transaction simulation is not enabled for Solana")
   * const result = await client.scan.scanTransaction('SignerBase58...', {
   *   tx: {
   *     from: 'SignerBase58...',
   *     raw: Buffer.from(tx.serialize({ requireAllSignatures: false })).toString('base64'),
   *   },
   *   chain: 'sol',
   * });
   * console.log(result.hash, result.unverified ? result.revertReason : result.simulation.length);
   * ```
   */
  async scanTransaction(
    fromAddress: string,
    request: ScanSolanaTransactionRequest,
    options?: ScanOptions
  ): Promise<ScanSolanaResponse>;
  async scanTransaction(
    fromAddress: string,
    request: ScanTransactionRequest,
    options?: ScanOptions
  ): Promise<ScanResponse>;
  /** Either chain: narrow the result with `'hash' in result` (Solana only) */
  async scanTransaction(
    fromAddress: string,
    request: ScanTransactionRequest | ScanSolanaTransactionRequest,
    options?: ScanOptions
  ): Promise<ScanResponse | ScanSolanaResponse>;
  async scanTransaction(
    fromAddress: string,
    request: ScanTransactionRequest | ScanSolanaTransactionRequest,
    options: ScanOptions = {}
  ): Promise<ScanResponse | ScanSolanaResponse> {
    this.validateSignerAddress(fromAddress);
    this.validateTransactionRequest(request);
    // Base58 is case-sensitive: compare Solana signers exactly, unlike EVM hex.
    this.validateSignerAddressMatch(fromAddress, request.tx.from, 'tx.from', {
      caseSensitive: request.chain === 'sol',
    });

    const path = this.buildPath(`/scan/${encodeURIComponent(fromAddress)}/transactions`, {
      refreshCache: options.refreshCache,
    });

    const response: HttpResponse<ScanResponse | ScanSolanaResponse> = await this.httpClient.post(
      path,
      request,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Scan an EIP-712 typed message for security risks before signing
   *
   * Analyzes EIP-712 typed data and returns `simulation` with the risk profile
   * of the spender / recipient named in the message (`counterpartyRisk`), of
   * the contract(s) involved (`partyRisk`), the dApp `domainRisk` when a
   * `domain` was passed, and a `functionRisk` when the typed data embeds
   * calldata for a known-risky function. Only Ethereum mainnet (`domain.chainId: 1`)
   * is supported.
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
   * const spender = result.simulation.counterpartyRisk;
   * if ((spender?.high ?? 0) > 0 || result.simulation.domainRisk?.riskLevel === 'high') {
   *   console.warn('High risk spender!', spender?.issues?.flatMap((i) => i.tags.map((t) => t.name)));
   * }
   * ```
   */
  async scanEip712(
    fromAddress: string,
    request: ScanEIP712Request,
    options: ScanOptions = {}
  ): Promise<ScanEIP712Response> {
    this.validateSignerAddress(fromAddress);
    this.validateEip712Request(request);
    this.validateSignerAddressMatch(fromAddress, request.msg.from, 'msg.from');

    const path = this.buildPath(`/scan/${encodeURIComponent(fromAddress)}/eip712`, {
      refreshCache: options.refreshCache,
    });

    const response: HttpResponse<ScanEIP712Response> = await this.httpClient.post(
      path,
      request,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Initiate a wallet risk score scan
   *
   * Starts an asynchronous risk analysis for the given address.
   * Use `getRiskScanStatus()` to poll for completion.
   *
   * @param address - Wallet address to scan
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Scan initiation response
   *
   * @example
   * ```typescript
   * // Start a risk scan
   * const result = await client.scan.startRiskScan('0x...', { chain: Chain.ETH });
   *
   * // Poll for completion
   * const status = await client.scan.getRiskScanStatus('0x...', { chain: Chain.ETH });
   * ```
   */
  async startRiskScan(address: string, options: RiskScanOptions = {}): Promise<RiskScanResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const path = this.buildPath(`/scan/${encodeURIComponent(address)}`, { chain });

    const response: HttpResponse<RiskScanResponse> = await this.httpClient.post(
      path,
      undefined,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Get the status of a wallet risk score scan
   *
   * Polls the status of a previously initiated risk scan.
   * Returns scan progress and results when complete.
   *
   * @param address - Wallet address that was scanned
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Scan status response
   *
   * @example
   * ```typescript
   * const status = await client.scan.getRiskScanStatus('0x...', { chain: Chain.ETH });
   * if (status.status === 'complete') {
   *   console.log(`Risk score: ${status.score}`);
   * }
   * ```
   */
  async getRiskScanStatus(
    address: string,
    options: RiskScanOptions = {}
  ): Promise<RiskScanStatusResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const path = this.buildPath(`/status/${encodeURIComponent(address)}`, { chain });

    const response: HttpResponse<RiskScanStatusResponse> = await this.httpClient.get(
      path,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Validate signer address format (basic non-empty check)
   *
   * Note: This is a simpler validation than the chain-aware validation in BaseResource;
   * the API validates the address for the scan's chain.
   */
  private validateSignerAddress(address: string): void {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new ValidationError('Address is required and must be a non-empty string.');
    }
  }

  /**
   * Validate that the signer address matches the address in the request
   */
  private validateSignerAddressMatch(
    signerAddress: string,
    requestAddress: string,
    fieldName: string,
    { caseSensitive = false }: { caseSensitive?: boolean } = {}
  ): void {
    const norm = (a: string) => (caseSensitive ? a.trim() : a.toLowerCase());
    if (norm(signerAddress) !== norm(requestAddress)) {
      throw new ValidationError(`Signer address must match ${fieldName}.`);
    }
  }

  /**
   * Validate transaction scan request
   */
  private validateTransactionRequest(
    request: ScanTransactionRequest | ScanSolanaTransactionRequest
  ): void {
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
    if (request.chain === 'sol') {
      const raw = request.tx.raw.trim();
      // Same check as the API. `0x…` is EVM hex; no serialized Solana
      // transaction encodes to that prefix.
      if (raw.startsWith('0x') || !BASE64.test(raw)) {
        throw new ValidationError(
          'Solana raw transaction (tx.raw) must be a base64 serialized transaction.'
        );
      }
      // JS callers can still send the EVM-only knobs, which the API rejects.
      const evmOnly = request as { block?: unknown; operation?: unknown };
      if (evmOnly.block !== undefined || evmOnly.operation !== undefined) {
        throw new ValidationError('`block` and `operation` are not supported for Solana.');
      }
      return;
    }
    if (!VALID_SCAN_CHAIN_IDS.includes(request.chain)) {
      throw new ValidationError(
        `Invalid chain ID. Supported chain IDs: ${VALID_SCAN_CHAIN_IDS.join(', ')} (1=ETH, 56=BSC, 137=POL, 10=OPT, 42161=ARB, 8453=BASE), or 'sol'`
      );
    }
  }

  /**
   * Validate EIP-712 scan request
   */
  private validateEip712Request(request: ScanEIP712Request): void {
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
    if (!VALID_SCAN_CHAIN_IDS.includes(request.msg.data.domain.chainId as ScanChainId)) {
      throw new ValidationError(
        `Invalid chain ID in EIP-712 domain. Supported chain IDs: ${VALID_SCAN_CHAIN_IDS.join(', ')} (1=ETH, 56=BSC, 137=POL, 10=OPT, 42161=ARB, 8453=BASE)`
      );
    }
    if (!request.msg.data.message || typeof request.msg.data.message !== 'object') {
      throw new ValidationError('EIP-712 message (msg.data.message) is required.');
    }
    if (Object.keys(request.msg.data.message).length === 0) {
      throw new ValidationError('EIP-712 message (msg.data.message) cannot be empty.');
    }
  }
}
