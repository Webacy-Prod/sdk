import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionsResource } from '../resources/transactions';
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

describe('TransactionsResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let transactions: TransactionsResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    transactions = new TransactionsResource(mockHttpClient as unknown as HttpClient);
  });

  describe('analyze', () => {
    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      await expect(transactions.analyze('0xabc123')).rejects.toThrow(ValidationError);
      await expect(transactions.analyze('0xabc123')).rejects.toThrow('Chain is required');
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for unsupported chain', async () => {
      await expect(transactions.analyze('0xabc123', { chain: 'ton' as Chain })).rejects.toThrow(
        ValidationError
      );
      await expect(transactions.analyze('0xabc123', { chain: 'ton' as Chain })).rejects.toThrow(
        'not supported for transaction analysis'
      );
    });

    it('should throw ValidationError for empty txHash', async () => {
      await expect(transactions.analyze('', { chain: Chain.ETH })).rejects.toThrow(ValidationError);
      await expect(transactions.analyze('   ', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make API call with valid txHash', async () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { txHash, riskScore: 25 },
        status: 200,
        headers: new Headers(),
      });

      const result = await transactions.analyze(txHash, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/transactions/${encodeURIComponent(txHash)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.riskScore).toBe(25);
    });

    it('should include hideTrustFlags when provided', async () => {
      const txHash = '0x1234567890abcdef';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { txHash, riskScore: 10 },
        status: 200,
        headers: new Headers(),
      });

      await transactions.analyze(txHash, { chain: Chain.ETH, hideTrustFlags: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('hide_trust_flags=true'),
        expect.any(Object)
      );
    });

    it('should use default chain when no chain is provided in options', async () => {
      const txHash = '0x1234567890abcdef';
      const transactionsWithDefault = new TransactionsResource(
        mockHttpClient as unknown as HttpClient,
        Chain.ETH
      );

      mockHttpClient.get.mockResolvedValueOnce({
        data: { txHash, riskScore: 15 },
        status: 200,
        headers: new Headers(),
      });

      await transactionsWithDefault.analyze(txHash);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        expect.any(Object)
      );
    });

    it('should support all valid chains for transaction analysis', async () => {
      const txHash = '0x1234567890abcdef';
      const supportedChains: Chain[] = [
        'eth',
        'base',
        'bsc',
        'pol',
        'opt',
        'arb',
        'sol',
        'stellar',
      ];

      for (const chain of supportedChains) {
        mockHttpClient.get.mockResolvedValueOnce({
          data: { txHash, chain },
          status: 200,
          headers: new Headers(),
        });

        await transactions.analyze(txHash, { chain });

        expect(mockHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`chain=${chain}`),
          expect.any(Object)
        );
      }
    });
  });
});
