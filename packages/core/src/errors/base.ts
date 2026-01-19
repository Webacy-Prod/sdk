/**
 * Base error class for all Webacy SDK errors
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof WebacyError) {
 *     console.error(`Error: ${error.message}`);
 *     console.error(`Code: ${error.code}`);
 *     if (error.endpoint) {
 *       console.error(`Endpoint: ${error.endpoint}`);
 *     }
 *     if (error.requestId) {
 *       console.error(`Request ID: ${error.requestId} (include this when contacting support)`);
 *     }
 *   }
 * }
 * ```
 */
export class WebacyError extends Error {
  /** HTTP status code if applicable */
  public readonly status?: number;

  /** Error code for programmatic handling */
  public readonly code: string;

  /** Original error if wrapped */
  public readonly cause?: Error;

  /** Request ID for support inquiries */
  public readonly requestId?: string;

  /** API endpoint that failed (for debugging) */
  public readonly endpoint?: string;

  constructor(
    message: string,
    options: {
      status?: number;
      code: string;
      cause?: Error;
      requestId?: string;
      endpoint?: string;
    }
  ) {
    super(message);
    this.name = 'WebacyError';
    this.status = options.status;
    this.code = options.code;
    this.cause = options.cause;
    this.requestId = options.requestId;
    this.endpoint = options.endpoint;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    return false;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      requestId: this.requestId,
      endpoint: this.endpoint,
    };
  }

  /**
   * Get a user-friendly description of how to resolve this error
   */
  getRecoverySuggestion(): string | undefined {
    return undefined;
  }
}
