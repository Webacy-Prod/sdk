import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolderAnalysisResource } from '../resources/holder-analysis';
import { Chain, ValidationError, HttpClient } from '@webacy/sdk-core';

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

describe('HolderAnalysisResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let holderAnalysis: HolderAnalysisResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    holderAnalysis = new HolderAnalysisResource(mockHttpClient as unknown as HttpClient);
  });

  describe('get', () => {
    it('should throw ValidationError for invalid Solana token address', async () => {
      await expect(holderAnalysis.get('invalid-address', { chain: Chain.SOL })).rejects.toThrow(
        ValidationError
      );

      await expect(holderAnalysis.get('0x1234', { chain: Chain.SOL })).rejects.toThrow(
        'Invalid Solana address'
      );

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid Ethereum token address', async () => {
      await expect(holderAnalysis.get('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );

      await expect(holderAnalysis.get('short', { chain: Chain.ETH })).rejects.toThrow(
        'Invalid Ethereum address'
      );
    });

    it('should make API call with valid Solana address', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const mockResponse = {
        token_address: validAddress,
        sniper_analysis: {
          sniper_count: 5,
          sniper_confidence_score: 0.75,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await holderAnalysis.get(validAddress, { chain: Chain.SOL });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/holder-analysis/${encodeURIComponent(validAddress)}?chain=sol`,
        expect.any(Object)
      );
      expect(result.sniper_analysis?.sniper_count).toBe(5);
    });

    it('should make API call with valid Ethereum address', async () => {
      const validAddress = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';
      const mockResponse = {
        token_address: validAddress,
        first_buyers_analysis: {
          bundled_buyers_count: 3,
        },
      };

      mockHttpClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await holderAnalysis.get(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/holder-analysis/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.first_buyers_analysis?.bundled_buyers_count).toBe(3);
    });

    it('should include disableRefetch when provided', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { token_address: validAddress },
        status: 200,
        headers: new Headers(),
      });

      await holderAnalysis.get(validAddress, {
        chain: Chain.SOL,
        disableRefetch: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('disableRefetch=true'),
        expect.any(Object)
      );
    });

    it('should pass timeout to httpClient', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { token_address: validAddress },
        status: 200,
        headers: new Headers(),
      });

      await holderAnalysis.get(validAddress, {
        chain: Chain.SOL,
        timeout: 60000,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 60000 })
      );
    });
  });
});
