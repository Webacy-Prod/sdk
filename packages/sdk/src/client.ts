import {
  BaseClient,
  WebacyClientConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from '@webacy/sdk-core';
import {
  HolderAnalysisResource,
  TradingLiteResource,
  TokensResource,
} from '@webacy/sdk-trading';
import {
  AddressesResource,
  ContractsResource,
  UrlResource,
  WalletsResource,
  LedgerResource,
  AccountTraceResource,
  UsageResource,
} from '@webacy/sdk-threat';

/**
 * Trading namespace containing all trading-related resources
 */
export interface TradingNamespace {
  /** Holder analysis resource */
  holderAnalysis: HolderAnalysisResource;
  /** Trading lite resource */
  tradingLite: TradingLiteResource;
  /** Tokens resource */
  tokens: TokensResource;
}

/**
 * Threat namespace containing all threat-related resources
 */
export interface ThreatNamespace {
  /** Addresses resource */
  addresses: AddressesResource;
  /** Contracts resource */
  contracts: ContractsResource;
  /** URL resource */
  url: UrlResource;
  /** Wallets resource */
  wallets: WalletsResource;
  /** Ledger resource */
  ledger: LedgerResource;
  /** Account trace resource */
  accountTrace: AccountTraceResource;
  /** Usage resource */
  usage: UsageResource;
}

/**
 * Unified Webacy SDK Client
 *
 * Provides access to all Webacy features including:
 * - **Trading**: Token holder analysis, sniper/bundler detection, trending tokens
 * - **Threat**: Address risk, sanctions, contracts, URL safety, wallet security
 *
 * This is the recommended package for most users as it provides access to
 * all Webacy features in a single client.
 *
 * @example
 * ```typescript
 * import { WebacyClient, Chain, RiskModule } from '@webacy/sdk';
 *
 * const client = new WebacyClient({
 *   apiKey: process.env.WEBACY_API_KEY!,
 * });
 *
 * // Trading: Holder analysis with sniper/bundler detection
 * const holders = await client.trading.holderAnalysis.get('token_address', {
 *   chain: 'sol',
 * });
 *
 * // Threat: Address risk analysis
 * const risk = await client.threat.addresses.analyze('0x...', {
 *   chain: 'eth',
 *   modules: [RiskModule.FUND_FLOW_SCREENING],
 * });
 *
 * // Analyze a token from both perspectives
 * const [holderData, riskData] = await Promise.all([
 *   client.trading.holderAnalysis.get('0x...', { chain: 'eth' }),
 *   client.threat.addresses.analyze('0x...', { chain: 'eth' }),
 * ]);
 * ```
 */
export class WebacyClient extends BaseClient {
  /**
   * Trading namespace
   *
   * Contains all trading-related resources:
   * - `holderAnalysis` - Token holder distribution and sniper detection
   * - `tradingLite` - Simplified trading analysis (Solana)
   * - `tokens` - Token pools and trending data
   */
  public readonly trading: TradingNamespace;

  /**
   * Threat namespace
   *
   * Contains all threat-related resources:
   * - `addresses` - Address risk and sanctions screening
   * - `contracts` - Smart contract security analysis
   * - `url` - URL safety checking
   * - `wallets` - Wallet transaction and approval analysis
   * - `ledger` - Hardware wallet transaction scanning
   * - `accountTrace` - Fund flow tracing
   * - `usage` - API usage management
   */
  public readonly threat: ThreatNamespace;

  /**
   * Create a new WebacyClient instance
   *
   * @param config - Client configuration
   * @throws AuthenticationError if API key is not provided
   *
   * @example
   * ```typescript
   * // Basic setup
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   * });
   *
   * // With custom configuration
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   *   timeout: 60000,
   *   retry: {
   *     maxRetries: 5,
   *     initialDelay: 2000,
   *   },
   * });
   *
   * // With custom headers
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   *   headers: {
   *     'X-Custom-Header': 'value',
   *   },
   * });
   * ```
   */
  constructor(config: WebacyClientConfig) {
    super(config);

    // Initialize trading namespace
    this.trading = {
      holderAnalysis: new HolderAnalysisResource(this.httpClient, this.defaultChain),
      tradingLite: new TradingLiteResource(this.httpClient, this.defaultChain),
      tokens: new TokensResource(this.httpClient, this.defaultChain),
    };

    // Initialize threat namespace
    this.threat = {
      addresses: new AddressesResource(this.httpClient, this.defaultChain),
      contracts: new ContractsResource(this.httpClient, this.defaultChain),
      url: new UrlResource(this.httpClient), // Chain-agnostic
      wallets: new WalletsResource(this.httpClient, this.defaultChain),
      ledger: new LedgerResource(this.httpClient), // Chain-agnostic
      accountTrace: new AccountTraceResource(this.httpClient, this.defaultChain),
      usage: new UsageResource(this.httpClient), // Chain-agnostic
    };
  }

  /**
   * Add a request interceptor
   *
   * Request interceptors are called before each request is sent.
   * Use them to modify requests, add headers, or log requests.
   *
   * @example
   * ```typescript
   * client.addRequestInterceptor((url, config) => {
   *   console.log(`Making request to ${url}`);
   *   return config;
   * });
   * ```
   */
  override addRequestInterceptor(interceptor: RequestInterceptor): void {
    super.addRequestInterceptor(interceptor);
  }

  /**
   * Add a response interceptor
   *
   * Response interceptors are called after each successful response.
   * Use them to transform responses or log data.
   *
   * @example
   * ```typescript
   * client.addResponseInterceptor((response) => {
   *   console.log(`Received ${response.status} response`);
   *   return response;
   * });
   * ```
   */
  override addResponseInterceptor(interceptor: ResponseInterceptor): void {
    super.addResponseInterceptor(interceptor);
  }

  /**
   * Add an error interceptor
   *
   * Error interceptors are called when a request fails.
   * Use them to handle errors globally or transform error types.
   *
   * @example
   * ```typescript
   * client.addErrorInterceptor((error) => {
   *   if (error instanceof RateLimitError) {
   *     console.warn('Rate limited, will retry...');
   *   }
   *   return error;
   * });
   * ```
   */
  override addErrorInterceptor(interceptor: ErrorInterceptor): void {
    super.addErrorInterceptor(interceptor);
  }
}
