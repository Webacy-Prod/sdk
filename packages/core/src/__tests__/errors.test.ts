import { describe, it, expect } from 'vitest';
import {
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '../errors';

describe('WebacyError', () => {
  it('should create error with message and code', () => {
    const error = new WebacyError('Test error', { code: 'TEST_ERROR' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('WebacyError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create error with status and requestId', () => {
    const error = new WebacyError('Test error', {
      code: 'INTERNAL_ERROR',
      status: 500,
      requestId: 'req-123',
    });
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.requestId).toBe('req-123');
  });

  it('should have toJSON method', () => {
    const error = new WebacyError('Test error', {
      code: 'TEST_ERROR',
      status: 500,
      requestId: 'req-123',
    });
    const json = error.toJSON();
    expect(json.name).toBe('WebacyError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe('TEST_ERROR');
    expect(json.status).toBe(500);
    expect(json.requestId).toBe('req-123');
  });

  it('should not be retryable by default', () => {
    const error = new WebacyError('Test error', { code: 'TEST_ERROR' });
    expect(error.isRetryable()).toBe(false);
  });
});

describe('AuthenticationError', () => {
  it('should create authentication error with 401 status', () => {
    const error = new AuthenticationError('Invalid API key');
    expect(error.message).toBe('Invalid API key');
    expect(error.status).toBe(401);
    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.name).toBe('AuthenticationError');
    expect(error instanceof WebacyError).toBe(true);
  });
});

describe('RateLimitError', () => {
  it('should create rate limit error with 429 status', () => {
    const error = new RateLimitError('Too many requests');
    expect(error.message).toBe('Too many requests');
    expect(error.status).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_ERROR');
    expect(error.name).toBe('RateLimitError');
  });

  it('should include retryAfter value', () => {
    const error = new RateLimitError('Too many requests', { retryAfter: 60 });
    expect(error.retryAfter).toBe(60);
  });

  it('should include resetAt timestamp', () => {
    const resetAt = Date.now() + 60000;
    const error = new RateLimitError('Too many requests', { resetAt });
    expect(error.resetAt).toBe(resetAt);
  });

  it('should be retryable', () => {
    const error = new RateLimitError('Too many requests');
    expect(error.isRetryable()).toBe(true);
  });
});

describe('ValidationError', () => {
  it('should create validation error with 400 status', () => {
    const error = new ValidationError('Invalid address');
    expect(error.message).toBe('Invalid address');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  it('should include validation errors object', () => {
    const errors = {
      address: ['Invalid format', 'Too short'],
      chain: ['Unsupported chain'],
    };
    const error = new ValidationError('Validation failed', { errors });
    expect(error.errors).toEqual(errors);
  });
});

describe('NotFoundError', () => {
  it('should create not found error with 404 status', () => {
    const error = new NotFoundError('Address not found');
    expect(error.message).toBe('Address not found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND_ERROR');
    expect(error.name).toBe('NotFoundError');
  });
});

describe('NetworkError', () => {
  it('should create network error', () => {
    const error = new NetworkError('Connection failed');
    expect(error.message).toBe('Connection failed');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.name).toBe('NetworkError');
  });

  it('should include original error as cause', () => {
    const originalError = new Error('Socket timeout');
    const error = new NetworkError('Connection failed', { cause: originalError });
    expect(error.cause).toBe(originalError);
  });

  it('should be retryable', () => {
    const error = new NetworkError('Connection failed');
    expect(error.isRetryable()).toBe(true);
  });
});

describe('Error hierarchy', () => {
  it('should properly identify error types with instanceof', () => {
    const authError = new AuthenticationError('Invalid key');
    const rateError = new RateLimitError('Too many requests');
    const validError = new ValidationError('Invalid input');
    const notFoundError = new NotFoundError('Not found');
    const networkError = new NetworkError('Network issue');

    // All should be instances of WebacyError
    expect(authError instanceof WebacyError).toBe(true);
    expect(rateError instanceof WebacyError).toBe(true);
    expect(validError instanceof WebacyError).toBe(true);
    expect(notFoundError instanceof WebacyError).toBe(true);
    expect(networkError instanceof WebacyError).toBe(true);

    // But only their own type
    expect(authError instanceof AuthenticationError).toBe(true);
    expect(authError instanceof RateLimitError).toBe(false);
    expect(rateError instanceof RateLimitError).toBe(true);
    expect(rateError instanceof AuthenticationError).toBe(false);
  });
});
