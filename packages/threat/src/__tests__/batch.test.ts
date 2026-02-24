import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchResource } from '../resources/batch';
import { Chain, ValidationError, HttpClient } from '@webacy-xyz/sdk-core';

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

describe('BatchResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let batch: BatchResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    batch = new BatchResource(mockHttpClient as unknown as HttpClient);
  });

  describe('contracts', () => {
    it('should throw ValidationError for empty addresses array', async () => {
      await expect(batch.contracts({ addresses: [], chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make POST to /query/contracts', async () => {
      const request = {
        addresses: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
        chain: Chain.ETH,
      };
      mockHttpClient.post.mockResolvedValueOnce({
        data: { results: [] },
        status: 200,
        headers: new Headers(),
      });

      await batch.contracts(request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/query/contracts',
        request,
        expect.any(Object)
      );
    });

    it('should pass timeout to httpClient', async () => {
      const request = {
        addresses: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
        chain: Chain.ETH,
      };
      mockHttpClient.post.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: new Headers(),
      });

      await batch.contracts(request, { timeout: 30000 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/query/contracts',
        request,
        expect.objectContaining({ timeout: 30000 })
      );
    });
  });

  describe('addresses', () => {
    it('should throw ValidationError for empty addresses array', async () => {
      await expect(batch.addresses({ addresses: [], chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make POST to /query/addresses', async () => {
      const request = {
        addresses: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'],
        chain: Chain.ETH,
      };
      mockHttpClient.post.mockResolvedValueOnce({
        data: { results: [] },
        status: 200,
        headers: new Headers(),
      });

      await batch.addresses(request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/query/addresses',
        request,
        expect.any(Object)
      );
    });
  });

  describe('transactions', () => {
    it('should throw ValidationError for empty transactions array', async () => {
      await expect(batch.transactions({ transactions: [], chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make POST to /batch/transactions', async () => {
      const request = {
        transactions: ['0xabc123'],
        chain: Chain.ETH,
      };
      mockHttpClient.post.mockResolvedValueOnce({
        data: { results: [] },
        status: 200,
        headers: new Headers(),
      });

      await batch.transactions(request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/batch/transactions',
        request,
        expect.any(Object)
      );
    });
  });
});
