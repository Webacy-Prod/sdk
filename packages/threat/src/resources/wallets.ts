import { HttpResponse, BaseResource } from '@webacy-xyz/sdk-core';
import {
  WalletTransactionsResponse,
  WalletApprovalsResponse,
  WalletTransactionsOptions,
  WalletApprovalsOptions,
} from '../types';

/**
 * Resource for wallet transaction and approval analysis
 *
 * Provides security analysis for wallet activity including:
 * - Transaction risk analysis
 * - Token approval monitoring
 * - Counterparty risk assessment
 *
 * @example
 * ```typescript
 * // Get transaction risks
 * const txs = await client.wallets.getTransactions('0x...', { chain: Chain.ETH });
 *
 * // Get token approvals
 * const approvals = await client.wallets.getApprovals('0x...', { chain: Chain.ETH });
 *
 * // With default chain configured, chain can be omitted
 * const client = new ThreatClient({ apiKey: '...', defaultChain: Chain.ETH });
 * const txs = await client.wallets.getTransactions('0x...'); // Uses ETH
 * ```
 */
export class WalletsResource extends BaseResource {
  /**
   * Get wallet transaction risk analysis
   *
   * Analyzes recent transactions for security risks including:
   * - Interactions with risky addresses
   * - Sanctioned counterparties
   * - Suspicious patterns
   *
   * @param address - Wallet address
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Transaction risk analysis
   *
   * @example
   * ```typescript
   * const result = await client.wallets.getTransactions('0x...', {
   *   chain: Chain.ETH,
   *   limit: 50,
   * });
   *
   * // With default chain configured
   * const result = await client.wallets.getTransactions('0x...');
   *
   * console.log(`Total issues: ${result.count}`);
   * console.log(`High risk: ${result.high}`);
   * console.log(`Overall risk: ${result.overallRisk}`);
   *
   * for (const issue of result.issues) {
   *   if (issue.transaction.sanctioned_address) {
   *     console.error('Transaction with sanctioned address!');
   *   }
   * }
   * ```
   */
  async getTransactions(
    address: string,
    options: WalletTransactionsOptions = {}
  ): Promise<WalletTransactionsResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const path = this.buildPath(`/wallets/${encodeURIComponent(address)}/transactions`, {
      chain,
      limit: options.limit,
      offset: options.offset,
    });

    const response: HttpResponse<WalletTransactionsResponse> = await this.httpClient.get(
      path,
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Get wallet token approvals
   *
   * Lists all active token approvals for a wallet,
   * with risk assessment for each spender.
   *
   * @param address - Wallet address
   * @param options - Request options (chain is optional if defaultChain is set)
   * @returns Token approvals with risk data
   *
   * @example
   * ```typescript
   * const result = await client.wallets.getApprovals('0x...', {
   *   chain: Chain.ETH,
   * });
   *
   * // With default chain configured
   * const result = await client.wallets.getApprovals('0x...');
   *
   * console.log(`Total approvals: ${result.count}`);
   * console.log(`High risk approvals: ${result.high_risk_count}`);
   *
   * for (const approval of result.approvals) {
   *   if (approval.is_unlimited) {
   *     console.warn(`Unlimited approval to ${approval.spender}`);
   *   }
   *   if (approval.spender_risk && approval.spender_risk > 50) {
   *     console.error(`High risk spender: ${approval.spender}`);
   *   }
   * }
   * ```
   */
  async getApprovals(
    address: string,
    options: WalletApprovalsOptions = {}
  ): Promise<WalletApprovalsResponse> {
    const chain = this.resolveChain(options);
    this.validateAddress(address, chain);

    const path = this.buildPath(`/wallets/${encodeURIComponent(address)}/approvals`, { chain });

    const response: HttpResponse<WalletApprovalsResponse> = await this.httpClient.get(
      path,
      this.requestOptions(options)
    );

    return response.data;
  }
}
