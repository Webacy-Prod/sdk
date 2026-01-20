import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokensResource } from '../resources/tokens';
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

describe('TokensResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let tokens: TokensResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    tokens = new TokensResource(mockHttpClient as unknown as HttpClient);
  });

  describe('getToken', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(
        tokens.getToken('invalid', { chain: 'eth', metricsDate: '15-01-2024' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for unsupported chain', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tokens.getToken(validAddress, { chain: 'ton' as 'eth', metricsDate: '15-01-2024' })
      ).rejects.toThrow(ValidationError);
      await expect(
        tokens.getToken(validAddress, { chain: 'ton' as 'eth', metricsDate: '15-01-2024' })
      ).rejects.toThrow('not supported for token economics');
    });

    it('should throw ValidationError for invalid date format', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tokens.getToken(validAddress, { chain: 'eth', metricsDate: '2024-01-15' })
      ).rejects.toThrow(ValidationError);
      await expect(
        tokens.getToken(validAddress, { chain: 'eth', metricsDate: '2024-01-15' })
      ).rejects.toThrow('DD-MM-YYYY');
    });

    it('should throw ValidationError for missing date', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tokens.getToken(validAddress, { chain: 'eth', metricsDate: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should make API call with valid parameters', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          address: validAddress,
          name: 'Test Token',
          symbol: 'TEST',
          metrics: { priceUsd: '1.50' },
        },
        status: 200,
        headers: new Headers(),
      });

      const result = await tokens.getToken(validAddress, {
        chain: 'eth',
        metricsDate: '15-01-2024',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/tokens/${encodeURIComponent(validAddress)}?chain=eth&metrics-date=15-01-2024`,
        expect.any(Object)
      );
      expect(result.name).toBe('Test Token');
      expect(result.metrics.priceUsd).toBe('1.50');
    });

    it('should support all valid chains for token economics', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const supportedChains = ['eth', 'base', 'bsc', 'pol', 'opt', 'arb'] as const;

      for (const chain of supportedChains) {
        mockHttpClient.get.mockResolvedValueOnce({
          data: { address: validAddress, chain, metrics: {} },
          status: 200,
          headers: new Headers(),
        });

        await tokens.getToken(validAddress, { chain, metricsDate: '15-01-2024' });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`chain=${chain}`),
          expect.any(Object)
        );
      }
    });
  });

  describe('getPoolOhlcv', () => {
    it('should throw ValidationError for invalid pool address', async () => {
      await expect(
        tokens.getPoolOhlcv('invalid', { chain: 'eth', timeFrame: 'hour' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for unsupported chain', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tokens.getPoolOhlcv(validAddress, { chain: 'ton' as 'eth', timeFrame: 'hour' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid timeFrame', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tokens.getPoolOhlcv(validAddress, { chain: 'eth', timeFrame: 'week' as 'hour' })
      ).rejects.toThrow(ValidationError);
      await expect(
        tokens.getPoolOhlcv(validAddress, { chain: 'eth', timeFrame: 'week' as 'hour' })
      ).rejects.toThrow('Invalid time frame');
    });

    it('should make API call with valid parameters', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          poolAddress: validAddress,
          timeFrame: 'hour',
          data: [
            {
              open: '1.0',
              high: '1.1',
              low: '0.9',
              close: '1.05',
              volume: '1000',
              timestamp: 1234567890,
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      });

      const result = await tokens.getPoolOhlcv(validAddress, {
        chain: 'eth',
        timeFrame: 'hour',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/tokens/pools/${encodeURIComponent(validAddress)}?chain=eth&timeFrame=hour`,
        expect.any(Object)
      );
      expect(result.timeFrame).toBe('hour');
      expect(result.data).toHaveLength(1);
    });

    it('should include optional parameters when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { poolAddress: validAddress, timeFrame: 'day', data: [] },
        status: 200,
        headers: new Headers(),
      });

      await tokens.getPoolOhlcv(validAddress, {
        chain: 'eth',
        timeFrame: 'day',
        beforeTimestamp: 1234567890,
        limit: 30,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('beforeTimestamp=1234567890'),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=30'),
        expect.any(Object)
      );
    });

    it('should support all valid timeFrames', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const validTimeFrames = ['minute', 'hour', 'day'] as const;

      for (const timeFrame of validTimeFrames) {
        mockHttpClient.get.mockResolvedValueOnce({
          data: { poolAddress: validAddress, timeFrame, data: [] },
          status: 200,
          headers: new Headers(),
        });

        await tokens.getPoolOhlcv(validAddress, { chain: 'eth', timeFrame });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`timeFrame=${timeFrame}`),
          expect.any(Object)
        );
      }
    });
  });
});
