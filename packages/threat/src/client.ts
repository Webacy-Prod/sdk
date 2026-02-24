import { BaseClient, WebacyClientConfig } from '@webacy-xyz/sdk-core';
import { AddressesResource } from './resources/addresses';
import { ContractsResource } from './resources/contracts';
import { UrlResource } from './resources/url';
import { WalletsResource } from './resources/wallets';
import { LedgerResource } from './resources/ledger';
import { AccountTraceResource } from './resources/account-trace';
import { UsageResource } from './resources/usage';
import { TransactionsResource } from './resources/transactions';
import { ScanResource } from './resources/scan';
import { BatchResource } from './resources/batch';

/**
 * Webacy Threat SDK Client
 *
 * Provides access to threat and risk analysis including address risk,
 * sanctions screening, contract security, URL safety, and more.
 *
 * @example
 * ```typescript
 * import { ThreatClient, Chain, RiskModule } from '@webacy-xyz/sdk-threat';
 *
 * const client = new ThreatClient({
 *   apiKey: process.env.WEBACY_API_KEY!,
 * });
 *
 * // Address risk analysis
 * const risk = await client.addresses.analyze('0x...', { chain: 'eth' });
 *
 * // Sanctions screening
 * const sanctioned = await client.addresses.checkSanctioned('0x...', { chain: 'eth' });
 *
 * // URL safety check
 * const urlRisk = await client.url.check('https://suspicious-site.com');
 * ```
 */
export class ThreatClient extends BaseClient {
  /**
   * Addresses resource
   *
   * Comprehensive security analysis for blockchain addresses including
   * risk scoring, sanctions screening, and address poisoning detection.
   */
  public readonly addresses: AddressesResource;

  /**
   * Contracts resource
   *
   * Smart contract security analysis including vulnerability detection,
   * source code analysis, and tax detection.
   */
  public readonly contracts: ContractsResource;

  /**
   * URL resource
   *
   * URL safety analysis to identify phishing sites and malicious domains.
   */
  public readonly url: UrlResource;

  /**
   * Wallets resource
   *
   * Wallet activity analysis including transaction risks and token approvals.
   */
  public readonly wallets: WalletsResource;

  /**
   * Ledger resource
   *
   * Hardware wallet transaction scanning for secure signing.
   */
  public readonly ledger: LedgerResource;

  /**
   * Account trace resource
   *
   * Fund flow tracing to identify connections to risky entities.
   */
  public readonly accountTrace: AccountTraceResource;

  /**
   * Usage resource
   *
   * API usage statistics and quota management.
   */
  public readonly usage: UsageResource;

  /**
   * Transactions resource
   *
   * Transaction risk analysis for blockchain transactions.
   */
  public readonly transactions: TransactionsResource;

  /**
   * Scan resource
   *
   * Pre-signing security analysis for transactions and EIP-712 messages.
   * Also provides wallet risk scanning methods.
   */
  public readonly scan: ScanResource;

  /**
   * Batch resource
   *
   * Batch risk analysis for multiple addresses, contracts, or transactions.
   */
  public readonly batch: BatchResource;

  /**
   * Create a new ThreatClient instance
   *
   * @param config - Client configuration
   * @throws AuthenticationError if API key is not provided
   *
   * @example
   * ```typescript
   * // Basic setup
   * const client = new ThreatClient({
   *   apiKey: 'your-api-key',
   * });
   *
   * // With default chain (omit chain in API calls)
   * const client = new ThreatClient({
   *   apiKey: 'your-api-key',
   *   defaultChain: Chain.ETH,
   * });
   *
   * // With custom configuration
   * const client = new ThreatClient({
   *   apiKey: 'your-api-key',
   *   timeout: 60000,
   *   retry: {
   *     maxRetries: 5,
   *   },
   * });
   * ```
   */
  constructor(config: WebacyClientConfig) {
    super(config);

    // Initialize resources with the HTTP client and default chain
    this.addresses = new AddressesResource(this.httpClient, this.defaultChain);
    this.contracts = new ContractsResource(this.httpClient, this.defaultChain);
    this.url = new UrlResource(this.httpClient, this.defaultChain);
    this.wallets = new WalletsResource(this.httpClient, this.defaultChain);
    this.ledger = new LedgerResource(this.httpClient, this.defaultChain);
    this.accountTrace = new AccountTraceResource(this.httpClient, this.defaultChain);
    this.usage = new UsageResource(this.httpClient, this.defaultChain);
    this.transactions = new TransactionsResource(this.httpClient, this.defaultChain);
    this.scan = new ScanResource(this.httpClient, this.defaultChain);
    this.batch = new BatchResource(this.httpClient, this.defaultChain);
  }

  // Interceptor methods (addRequestInterceptor, addResponseInterceptor, addErrorInterceptor)
  // are inherited from BaseClient and don't need to be overridden.
}
