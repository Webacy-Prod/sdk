import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletsResource } from '../resources/wallets';
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

describe('WalletsResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let wallets: WalletsResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    wallets = new WalletsResource(mockHttpClient as unknown as HttpClient);
  });

  describe('getTransactions', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(wallets.getTransactions('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      await expect(wallets.getTransactions(validAddress)).rejects.toThrow(ValidationError);
      await expect(wallets.getTransactions(validAddress)).rejects.toThrow('Chain is required');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should make API call with valid address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { count: 1, high: 0, overallRisk: 5, issues: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await wallets.getTransactions(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/wallets/${encodeURIComponent(validAddress)}/transactions?chain=eth`,
        expect.any(Object)
      );
      expect(result.count).toBe(1);
    });

    it('should include limit and offset in query params when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { count: 0, high: 0, overallRisk: 0, issues: [] },
        status: 200,
        headers: new Headers(),
      });

      await wallets.getTransactions(validAddress, { chain: Chain.ETH, limit: 50, offset: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/wallets/${encodeURIComponent(validAddress)}/transactions?chain=eth&limit=50&offset=10`,
        expect.any(Object)
      );
    });

    it('should use default chain when no chain is provided in options', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const walletsWithDefault = new WalletsResource(
        mockHttpClient as unknown as HttpClient,
        Chain.ETH
      );

      mockHttpClient.get.mockResolvedValueOnce({
        data: { count: 0, high: 0, overallRisk: 0, issues: [] },
        status: 200,
        headers: new Headers(),
      });

      await walletsWithDefault.getTransactions(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        expect.any(Object)
      );
    });
  });

  describe('getApprovals', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(wallets.getApprovals('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      await expect(wallets.getApprovals(validAddress)).rejects.toThrow(ValidationError);
      await expect(wallets.getApprovals(validAddress)).rejects.toThrow('Chain is required');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should make API call with valid address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { approvals: [], count: 0, high_risk_count: 0 },
        status: 200,
        headers: new Headers(),
      });

      const result = await wallets.getApprovals(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/wallets/${encodeURIComponent(validAddress)}/approvals?chain=eth`,
        expect.any(Object)
      );
      expect(result.count).toBe(0);
    });

    it('should use default chain when no chain is provided in options', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const walletsWithDefault = new WalletsResource(
        mockHttpClient as unknown as HttpClient,
        Chain.ETH
      );

      mockHttpClient.get.mockResolvedValueOnce({
        data: { approvals: [], count: 0, high_risk_count: 0 },
        status: 200,
        headers: new Headers(),
      });

      await walletsWithDefault.getApprovals(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        expect.any(Object)
      );
    });
  });
});
