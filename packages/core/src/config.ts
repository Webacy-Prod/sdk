import { RetryConfig } from './http/retry';

/**
 * Debug mode options
 */
export type DebugMode = boolean | 'requests' | 'responses' | 'errors' | 'all';

/**
 * Logger interface for custom logging implementations
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Default console logger implementation
 */
export const defaultLogger: Logger = {
  debug: (message, data) => console.debug(`[Webacy SDK] ${message}`, data ?? ''),
  info: (message, data) => console.info(`[Webacy SDK] ${message}`, data ?? ''),
  warn: (message, data) => console.warn(`[Webacy SDK] ${message}`, data ?? ''),
  error: (message, data) => console.error(`[Webacy SDK] ${message}`, data ?? ''),
};

/**
 * Webacy client configuration options
 */
export interface WebacyClientConfig {
  /**
   * Your Webacy API key
   * @required
   */
  apiKey: string;

  /**
   * Base URL for the API
   * @default 'https://api.webacy.com'
   */
  baseUrl?: string;

  /**
   * API version to use
   * @default 'v2'
   */
  apiVersion?: string;

  /**
   * Default request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Retry configuration for failed requests
   */
  retry?: Partial<RetryConfig>;

  /**
   * Custom headers to include with all requests
   */
  headers?: Record<string, string>;

  /**
   * Enable debug logging
   *
   * - `true` or `'all'`: Log requests, responses, and errors
   * - `'requests'`: Log only outgoing requests
   * - `'responses'`: Log only incoming responses
   * - `'errors'`: Log only errors
   * - `false`: Disable logging (default)
   *
   * @default false
   *
   * @example
   * ```typescript
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   *   debug: true, // Enable full debug logging
   * });
   * ```
   */
  debug?: DebugMode;

  /**
   * Custom logger instance
   *
   * Provide your own logger implementation (e.g., winston, pino)
   *
   * @example
   * ```typescript
   * import pino from 'pino';
   *
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   *   debug: true,
   *   logger: pino({ level: 'debug' }),
   * });
   * ```
   */
  logger?: Logger;

  /**
   * Default blockchain to use when chain is not specified
   *
   * When set, you can omit the `chain` parameter on API calls
   * and this chain will be used automatically.
   *
   * @example
   * ```typescript
   * import { Chain } from '@webacy-xyz/sdk';
   *
   * const client = new WebacyClient({
   *   apiKey: 'your-api-key',
   *   defaultChain: Chain.ETH,
   * });
   *
   * // No need to specify chain - uses ETH by default
   * const risk = await client.threat.addresses.analyze('0x...');
   *
   * // Can still override for specific calls
   * const solRisk = await client.threat.addresses.analyze('...', { chain: Chain.SOL });
   * ```
   */
  defaultChain?: import('./types').Chain;
}

/**
 * Default API configuration
 */
export const DEFAULT_CONFIG = {
  baseUrl: 'https://api.webacy.com',
  apiVersion: 'v2',
  timeout: 30000,
} as const;

/**
 * Build the full base URL from configuration
 */
export function buildBaseUrl(config: WebacyClientConfig): string {
  const baseUrl = config.baseUrl ?? DEFAULT_CONFIG.baseUrl;
  // API doesn't need /api/v2 prefix - endpoints are directly on base URL
  return baseUrl.replace(/\/$/, '');
}
