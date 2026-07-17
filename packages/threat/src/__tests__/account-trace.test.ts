import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountTraceResource } from '../resources/account-trace';
import { Chain, ValidationError, HttpClient } from '@webacy-xyz/sdk-core';

// Mock HttpClient
const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  addRequestInterceptor: vi.fn(),
  addResponseInterceptor: vi.fn(),
  addErrorInterceptor: vi.fn(),
});

describe('AccountTraceResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let accountTrace: AccountTraceResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    accountTrace = new AccountTraceResource(mockHttpClient as unknown as HttpClient);
  });

  describe('trace', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(accountTrace.trace('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      await expect(accountTrace.trace(validAddress)).rejects.toThrow(ValidationError);
      await expect(accountTrace.trace(validAddress)).rejects.toThrow('Chain is required');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should make API call with valid address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          connections: [],
          summary: {
            total_connections: 0,
            high_risk_connections: 0,
            sanctioned_connections: 0,
            mixer_connections: 0,
          },
        },
        status: 200,
        headers: new Headers(),
      });

      const result = await accountTrace.trace(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/account-trace/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.summary.total_connections).toBe(0);
    });

    it('should include depth in query params when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          connections: [],
          summary: {
            total_connections: 0,
            high_risk_connections: 0,
            sanctioned_connections: 0,
            mixer_connections: 0,
          },
        },
        status: 200,
        headers: new Headers(),
      });

      await accountTrace.trace(validAddress, { chain: Chain.ETH, depth: 2 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/account-trace/${encodeURIComponent(validAddress)}?chain=eth&depth=2`,
        expect.any(Object)
      );
    });

    it('should use default chain when no chain is provided in options', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const accountTraceWithDefault = new AccountTraceResource(
        mockHttpClient as unknown as HttpClient,
        Chain.ETH
      );

      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          connections: [],
          summary: {
            total_connections: 0,
            high_risk_connections: 0,
            sanctioned_connections: 0,
            mixer_connections: 0,
          },
        },
        status: 200,
        headers: new Headers(),
      });

      await accountTraceWithDefault.trace(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        expect.any(Object)
      );
    });
  });
});
