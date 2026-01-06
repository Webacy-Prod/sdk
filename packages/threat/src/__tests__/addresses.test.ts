import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddressesResource } from '../resources/addresses';
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

describe('AddressesResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let addresses: AddressesResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    addresses = new AddressesResource(mockHttpClient as unknown as HttpClient);
  });

  describe('analyze', () => {
    it('should throw ValidationError for invalid Ethereum address', async () => {
      await expect(addresses.analyze('invalid-address', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );

      await expect(addresses.analyze('invalid-address', { chain: Chain.ETH })).rejects.toThrow(
        'Invalid Ethereum address'
      );

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid Solana address', async () => {
      await expect(addresses.analyze('0x1234567890abcdef', { chain: Chain.SOL })).rejects.toThrow(
        ValidationError
      );

      await expect(addresses.analyze('0x1234567890abcdef', { chain: Chain.SOL })).rejects.toThrow(
        'Invalid Solana address'
      );
    });

    it('should make API call with valid Ethereum address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 25 },
        status: 200,
        headers: new Headers(),
      });

      const result = await addresses.analyze(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/addresses/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.overallRisk).toBe(25);
    });

    it('should make API call with valid Solana address', async () => {
      const validAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 10 },
        status: 200,
        headers: new Headers(),
      });

      const result = await addresses.analyze(validAddress, { chain: Chain.SOL });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/addresses/${encodeURIComponent(validAddress)}?chain=sol`,
        expect.any(Object)
      );
      expect(result.overallRisk).toBe(10);
    });

    it('should include modules in query params when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 25 },
        status: 200,
        headers: new Headers(),
      });

      await addresses.analyze(validAddress, {
        chain: Chain.ETH,
        modules: ['SANCTIONS_COMPLIANCE', 'FUND_FLOW_SCREENING'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('modules=SANCTIONS_COMPLIANCE'),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('modules=FUND_FLOW_SCREENING'),
        expect.any(Object)
      );
    });

    it('should include detailed flag when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 25 },
        status: 200,
        headers: new Headers(),
      });

      await addresses.analyze(validAddress, {
        chain: Chain.ETH,
        detailed: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('detailed=true'),
        expect.any(Object)
      );
    });

    it('should include deployerRisk flag when provided', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 25 },
        status: 200,
        headers: new Headers(),
      });

      await addresses.analyze(validAddress, {
        chain: Chain.ETH,
        deployerRisk: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('deployer_risk=true'),
        expect.any(Object)
      );
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      await expect(addresses.analyze(validAddress)).rejects.toThrow(ValidationError);
      await expect(addresses.analyze(validAddress)).rejects.toThrow('Chain is required');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should use default chain when no chain is provided in options', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const addressesWithDefault = new AddressesResource(
        mockHttpClient as unknown as HttpClient,
        Chain.ETH
      );

      mockHttpClient.get.mockResolvedValueOnce({
        data: { overallRisk: 25 },
        status: 200,
        headers: new Headers(),
      });

      await addressesWithDefault.analyze(validAddress);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        expect.any(Object)
      );
    });
  });

  describe('checkSanctioned', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(addresses.checkSanctioned('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make API call with valid address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { is_sanctioned: false },
        status: 200,
        headers: new Headers(),
      });

      const result = await addresses.checkSanctioned(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/addresses/sanctioned/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.is_sanctioned).toBe(false);
    });
  });

  describe('checkPoisoning', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(addresses.checkPoisoning('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should make API call with valid address', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { is_poisoned: false },
        status: 200,
        headers: new Headers(),
      });

      const result = await addresses.checkPoisoning(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/addresses/${encodeURIComponent(validAddress)}/poisoning?chain=eth`,
        expect.any(Object)
      );
      expect(result.is_poisoned).toBe(false);
    });
  });
});
