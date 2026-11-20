import { WebacyError } from './base';
import type { RateLimitDetails } from './rate-limit-details';

/**
 * Thrown when a request gets a 429 Too Many Requests.
 *
 * Plan-limit 429s carry `details`, exposed here as `limitType`, `limit`,
 * `currentUsage`, `resetAt` and `upgradeUrl`. The SDK retries only the ones that
 * can succeed soon: a `rate` 429 (waiting until `resetAt`) and a 429 without
 * `details` (a per-key gateway limit or a temporary service limit, with backoff).
 * A monthly request quota or compute unit 429 keeps failing until `resetAt` or a
 * plan upgrade, so it is thrown at once.
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.error('Rate limited:', error.message);
 *     if (error.upgradeUrl) {
 *       console.log(`Plan limit ${error.limitType ?? 'compute units'} reached, upgrade at ${error.upgradeUrl}`);
 *     }
 *   }
 * }
 * ```
 */
export class RateLimitError extends WebacyError {
  /** When the limit resets (Unix timestamp, seconds) */
  public readonly resetAt?: number;

  /** Number of seconds until reset */
  public readonly retryAfter?: number;

  /**
   * Which plan limit was reached: `quota` (monthly requests) or `rate` (requests per
   * second). Undefined for the monthly compute unit allowance and for 429s without
   * `details`; use `upgradeUrl` to tell a plan limit from the others.
   */
  public readonly limitType?: 'quota' | 'rate';

  /** The limit that was reached, as the API's decimal string */
  public readonly limit?: string;

  /** Usage this period, as the API's decimal string (absent for `rate`) */
  public readonly currentUsage?: string;

  /** Developer Portal page where the plan can be upgraded */
  public readonly upgradeUrl?: string;

  /** Whether the body carried plan-limit `details` */
  private readonly planLimit: boolean;

  /** Whether `details.limitType` was a value this SDK does not know */
  private readonly unknownLimitType: boolean;

  constructor(
    message = 'Rate limit exceeded',
    options: {
      resetAt?: number;
      retryAfter?: number;
      requestId?: string;
      endpoint?: string;
      details?: RateLimitDetails;
    } = {}
  ) {
    super(message, {
      status: 429,
      code: 'RATE_LIMIT_ERROR',
      requestId: options.requestId,
      endpoint: options.endpoint,
    });
    this.name = 'RateLimitError';
    const details = options.details;
    this.planLimit = details !== undefined;
    this.limitType =
      details?.limitType === 'quota' || details?.limitType === 'rate'
        ? details.limitType
        : undefined;
    this.unknownLimitType = details?.limitType !== undefined && this.limitType === undefined;
    this.limit = details?.limit;
    this.currentUsage = details?.currentUsage;
    this.upgradeUrl = details?.upgradeUrl;

    const resetMs = details?.resetAt ? Date.parse(details.resetAt) : NaN;
    this.resetAt = Number.isNaN(resetMs) ? options.resetAt : Math.ceil(resetMs / 1000);
    this.retryAfter = options.retryAfter;
  }

  /**
   * A `rate` 429 or one without `details` can succeed soon. A quota or compute
   * unit 429 (any other `details`) keeps failing until `resetAt` or an upgrade.
   */
  override isRetryable(): boolean {
    return !this.planLimit || this.limitType === 'rate';
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limitType: this.limitType,
      limit: this.limit,
      currentUsage: this.currentUsage,
      resetAt: this.resetAt,
      upgradeUrl: this.upgradeUrl,
    };
  }

  override getRecoverySuggestion(): string {
    if (this.planLimit && this.limitType !== 'rate') {
      const what =
        this.limitType === 'quota'
          ? 'monthly request quota'
          : this.unknownLimitType
            ? 'plan limit'
            : 'monthly compute unit allowance';
      const until = this.resetAt ? ` until ${new Date(this.resetAt * 1000).toISOString()}` : '';
      const upgrade = this.upgradeUrl ? ` at ${this.upgradeUrl}` : '';
      return `Your organization's ${what} is used up${until}. Upgrade your plan${upgrade} or wait for the reset.`;
    }
    if (this.retryAfter) {
      return `Wait ${this.retryAfter} seconds before retrying. Consider implementing request throttling or upgrading your API plan for higher limits.`;
    }
    return 'Wait a moment before retrying. Consider implementing request throttling or upgrading your API plan for higher limits.';
  }
}
