import { describe, it, expect } from 'vitest';
import {
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableStatusCode,
  sleep,
} from '../http/retry';

describe('DEFAULT_RETRY_CONFIG', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
    expect(DEFAULT_RETRY_CONFIG.initialDelay).toBe(1000);
    expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(30000);
    expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
    expect(Array.isArray(DEFAULT_RETRY_CONFIG.retryableStatusCodes)).toBe(true);
  });

  it('should include common retryable status codes', () => {
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(429); // Rate limit
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(500); // Internal error
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(502); // Bad gateway
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(503); // Service unavailable
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(504); // Gateway timeout
  });
});

describe('isRetryableStatusCode', () => {
  const config = DEFAULT_RETRY_CONFIG;

  it('should return true for 429 status', () => {
    expect(isRetryableStatusCode(429, config)).toBe(true);
  });

  it('should return true for 5xx status codes', () => {
    expect(isRetryableStatusCode(500, config)).toBe(true);
    expect(isRetryableStatusCode(502, config)).toBe(true);
    expect(isRetryableStatusCode(503, config)).toBe(true);
    expect(isRetryableStatusCode(504, config)).toBe(true);
  });

  it('should return false for 4xx (except 429 and 408)', () => {
    expect(isRetryableStatusCode(400, config)).toBe(false);
    expect(isRetryableStatusCode(401, config)).toBe(false);
    expect(isRetryableStatusCode(403, config)).toBe(false);
    expect(isRetryableStatusCode(404, config)).toBe(false);
  });

  it('should return false for success codes', () => {
    expect(isRetryableStatusCode(200, config)).toBe(false);
    expect(isRetryableStatusCode(201, config)).toBe(false);
    expect(isRetryableStatusCode(204, config)).toBe(false);
  });

  it('should use custom retryable status codes', () => {
    const customConfig: RetryConfig = {
      ...config,
      retryableStatusCodes: [418], // I'm a teapot
    };
    expect(isRetryableStatusCode(418, customConfig)).toBe(true);
    expect(isRetryableStatusCode(500, customConfig)).toBe(false);
  });
});

describe('calculateRetryDelay', () => {
  const config: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableStatusCodes: [429, 500],
  };

  it('should return delay based on initial delay for first retry', () => {
    const delay = calculateRetryDelay(0, config);
    // With 30% jitter, should be between 1000 and 1300
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1300);
  });

  it('should increase delay exponentially', () => {
    // Base delays: 1000, 2000, 4000
    const delay0 = calculateRetryDelay(0, config);
    const delay1 = calculateRetryDelay(1, config);
    const delay2 = calculateRetryDelay(2, config);

    // Each should roughly double (within jitter range)
    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay0).toBeLessThanOrEqual(1300);

    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay1).toBeLessThanOrEqual(2600);

    expect(delay2).toBeGreaterThanOrEqual(4000);
    expect(delay2).toBeLessThanOrEqual(5200);
  });

  it('should respect max delay', () => {
    const smallMaxConfig: RetryConfig = {
      ...config,
      maxDelay: 2000,
    };

    // At high attempt numbers, should not exceed maxDelay
    const delay = calculateRetryDelay(10, smallMaxConfig);
    expect(delay).toBeLessThanOrEqual(2000);
  });

  it('should use Retry-After header when provided', () => {
    const delay = calculateRetryDelay(0, config, 60);
    // 60 seconds = 60000ms
    expect(delay).toBe(30000); // Capped at maxDelay
  });

  it('should use Retry-After if smaller than max', () => {
    const delay = calculateRetryDelay(0, config, 5);
    // 5 seconds = 5000ms
    expect(delay).toBe(5000);
  });

  it('should add jitter for variance', () => {
    const delays = Array.from({ length: 100 }, () => calculateRetryDelay(0, config));
    const uniqueDelays = new Set(delays);

    // With jitter, we should get many different values
    expect(uniqueDelays.size).toBeGreaterThan(50);
  });
});

describe('sleep', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
    expect(elapsed).toBeLessThan(150);
  });
});
