import { WebacyError } from './base';

/**
 * Thrown when rate limit is exceeded
 *
 * The SDK automatically retries rate-limited requests with exponential backoff.
 * If you're seeing this error frequently, consider reducing request frequency
 * or upgrading your API plan.
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.error('Rate limited:', error.message);
 *     if (error.retryAfter) {
 *       console.log(`Retry after ${error.retryAfter} seconds`);
 *     }
 *   }
 * }
 * ```
 */
export class RateLimitError extends WebacyError {
  /** When the rate limit resets (Unix timestamp) */
  public readonly resetAt?: number;

  /** Number of seconds until reset */
  public readonly retryAfter?: number;

  constructor(
    message = 'Rate limit exceeded',
    options: { resetAt?: number; retryAfter?: number; requestId?: string; endpoint?: string } = {}
  ) {
    super(message, {
      status: 429,
      code: 'RATE_LIMIT_ERROR',
      requestId: options.requestId,
      endpoint: options.endpoint,
    });
    this.name = 'RateLimitError';
    this.resetAt = options.resetAt;
    this.retryAfter = options.retryAfter;
  }

  override isRetryable(): boolean {
    return true;
  }

  override getRecoverySuggestion(): string {
    if (this.retryAfter) {
      return `Wait ${this.retryAfter} seconds before retrying. Consider implementing request throttling or upgrading your API plan for higher limits.`;
    }
    return 'Wait a moment before retrying. Consider implementing request throttling or upgrading your API plan for higher limits.';
  }
}
