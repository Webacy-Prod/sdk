import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TradingLiteResource } from '../resources/trading-lite';
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

describe('TradingLiteResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let tradingLite: TradingLiteResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    tradingLite = new TradingLiteResource(mockHttpClient as unknown as HttpClient);
  });

  describe('analyze', () => {
    it('should throw ValidationError for invalid Solana address', async () => {
      await expect(
        tradingLite.analyze('invalid-address')
      ).rejects.toThrow(ValidationError);

      await expect(
        tradingLite.analyze('0x1234567890abcdef')
      ).rejects.toThrow('Invalid Solana token address');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for Ethereum address', async () => {
      // TradingLite only supports Solana
      const ethereumAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(
        tradingLite.analyze(ethereumAddress)
      ).rejects.toThrow(ValidationError);
    });

    it('should make API call with valid Solana address', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const mockResponse = {
        SniperPercentageOnLaunch: 15,
        BundlerPercentageHolding: 25,
        Top10Concentration: 45,
        DevLaunched24Hours: 2,
        mintable: false,
        freezable: false,
      };

      mockHttpClient.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await tradingLite.analyze(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/trading-lite/${encodeURIComponent(validAddress)}?chain=sol`,
        expect.any(Object)
      );
      expect(result.SniperPercentageOnLaunch).toBe(15);
      expect(result.BundlerPercentageHolding).toBe(25);
    });

    it('should default to SOL chain when not specified', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: new Headers(),
      });

      await tradingLite.analyze(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=sol'),
        expect.any(Object)
      );
    });

    it('should pass timeout option', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: new Headers(),
      });

      await tradingLite.analyze(validAddress, { timeout: 30000 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000 })
      );
    });

    it('should include error suggestion in ValidationError', async () => {
      try {
        await tradingLite.analyze('invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('Trading Lite only supports Solana');
      }
    });
  });
});
