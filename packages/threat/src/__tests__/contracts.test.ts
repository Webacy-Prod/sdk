import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContractsResource } from '../resources/contracts';
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

describe('ContractsResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let contracts: ContractsResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    contracts = new ContractsResource(mockHttpClient as unknown as HttpClient);
  });

  describe('analyze', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(contracts.analyze('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make API call with valid address and chain', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { score: 50, tags: [], categories: {} },
        status: 200,
        headers: new Headers(),
      });

      const result = await contracts.analyze(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/contracts/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.score).toBe(50);
    });

    it('should include fromBytecode when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { score: 50, tags: [], categories: {} },
        status: 200,
        headers: new Headers(),
      });

      await contracts.analyze(validAddress, {
        chain: Chain.ETH,
        fromBytecode: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('fromBytecode=true'),
        expect.any(Object)
      );
    });

    it('should include refreshCache when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { score: 50, tags: [], categories: {} },
        status: 200,
        headers: new Headers(),
      });

      await contracts.analyze(validAddress, {
        chain: Chain.ETH,
        refreshCache: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('refreshCache=true'),
        expect.any(Object)
      );
    });

    it('should include disableChecksum when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { score: 50, tags: [], categories: {} },
        status: 200,
        headers: new Headers(),
      });

      await contracts.analyze(validAddress, {
        chain: Chain.ETH,
        disableChecksum: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('disableChecksum=true'),
        expect.any(Object)
      );
    });
  });

  describe('getCodeAnalysis', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(contracts.getCodeAnalysis('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make API call with valid address and chain', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          contractAddress: validAddress,
          isVerified: true,
          securityScore: 85,
          findings: [],
        },
        status: 200,
        headers: new Headers(),
      });

      const result = await contracts.getCodeAnalysis(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/contracts/${encodeURIComponent(validAddress)}/code-analysis?chain=eth`,
        expect.any(Object)
      );
      expect(result.securityScore).toBe(85);
      expect(result.isVerified).toBe(true);
    });

    it('should include refreshCache when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { contractAddress: validAddress, findings: [] },
        status: 200,
        headers: new Headers(),
      });

      await contracts.getCodeAnalysis(validAddress, {
        chain: Chain.ETH,
        refreshCache: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('refreshCache=true'),
        expect.any(Object)
      );
    });

    it('should pass timeout to httpClient', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { contractAddress: validAddress, findings: [] },
        status: 200,
        headers: new Headers(),
      });

      await contracts.getCodeAnalysis(validAddress, {
        chain: Chain.ETH,
        timeout: 60000,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 60000 })
      );
    });
  });

  describe('getAudits', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(contracts.getAudits('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make GET to /audits/{address} with chain param', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { audits: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await contracts.getAudits(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/audits/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result).toEqual({ audits: [] });
    });
  });

  describe('getBySymbol', () => {
    it('should throw ValidationError for empty symbol', async () => {
      await expect(contracts.getBySymbol('')).rejects.toThrow(ValidationError);
      await expect(contracts.getBySymbol('   ')).rejects.toThrow(ValidationError);
    });

    it('should make GET to /contracts/symbol/{symbol}', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { symbol: 'USDC', contracts: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await contracts.getBySymbol('USDC');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/contracts/symbol/USDC', expect.any(Object));
      expect(result).toEqual({ symbol: 'USDC', contracts: [] });
    });

    it('should pass timeout to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: new Headers(),
      });

      await contracts.getBySymbol('ETH', { timeout: 10000 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 10000 })
      );
    });
  });
});
