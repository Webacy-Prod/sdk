import { WebacyError } from './base';

/**
 * Thrown when a network error occurs
 *
 * This includes timeouts, connection failures, and other transport-level errors.
 * The SDK automatically retries network errors with exponential backoff.
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof NetworkError) {
 *     console.error('Network error:', error.message);
 *     if (error.cause) {
 *       console.error('Cause:', error.cause.message);
 *     }
 *   }
 * }
 * ```
 */
export class NetworkError extends WebacyError {
  constructor(
    message = 'Network request failed',
    options: { cause?: Error; endpoint?: string } = {}
  ) {
    super(message, {
      code: 'NETWORK_ERROR',
      cause: options.cause,
      endpoint: options.endpoint,
    });
    this.name = 'NetworkError';
  }

  override isRetryable(): boolean {
    return true;
  }

  override getRecoverySuggestion(): string {
    if (this.message.includes('timed out')) {
      return 'The request timed out. Try increasing the timeout option or check your network connection.';
    }
    return 'Check your network connection and try again. If the problem persists, the Webacy API may be temporarily unavailable.';
  }
}
