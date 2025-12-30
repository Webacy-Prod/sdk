/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay between retries in milliseconds */
  initialDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** HTTP status codes that should trigger a retry */
  retryableStatusCodes: number[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate delay for a retry attempt using exponential backoff with jitter
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig,
  retryAfter?: number
): number {
  // If server provided Retry-After, use it
  if (retryAfter && retryAfter > 0) {
    return Math.min(retryAfter * 1000, config.maxDelay);
  }

  // Exponential backoff with jitter
  const exponentialDelay =
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
  const delay = exponentialDelay + jitter;

  return Math.min(delay, config.maxDelay);
}

/**
 * Check if a status code is retryable
 */
export function isRetryableStatusCode(
  statusCode: number,
  config: RetryConfig
): boolean {
  return config.retryableStatusCodes.includes(statusCode);
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
