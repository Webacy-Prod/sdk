import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LedgerResource } from '../resources/ledger';
import { HttpClient } from '@webacy-xyz/sdk-core';
import { LedgerScanRequest, LedgerEIP712Request } from '../types';

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

describe('LedgerResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let ledger: LedgerResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    ledger = new LedgerResource(mockHttpClient as unknown as HttpClient);
  });

  describe('scanTransaction', () => {
    it('should POST to /ledger/{family}/scan/tx with the request body', async () => {
      const request: LedgerScanRequest = {
        tx: {
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          raw: '0xabc123',
        },
        chain: 1,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        data: { is_safe: true, risk_level: 'safe', risks: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanTransaction('ethereum', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/tx',
        request,
        expect.any(Object)
      );
      expect(result.is_safe).toBe(true);
    });

    it('should pass timeout and signal options through', async () => {
      const request: LedgerScanRequest = {
        tx: {
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          raw: '0xabc123',
        },
        chain: 1,
      };
      const controller = new AbortController();

      mockHttpClient.post.mockResolvedValueOnce({
        data: { is_safe: true, risk_level: 'safe', risks: [] },
        status: 200,
        headers: new Headers(),
      });

      await ledger.scanTransaction('ethereum', request, {
        timeout: 5000,
        signal: controller.signal,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/ledger/ethereum/scan/tx', request, {
        timeout: 5000,
        signal: controller.signal,
      });
    });

    it('should build the path using the provided device family', async () => {
      const request: LedgerScanRequest = {
        tx: {
          from: 'BTCAddressPlaceholder',
          raw: '0xdeadbeef',
        },
        chain: 0,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        data: { is_safe: false, risk_level: 'high', risks: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanTransaction('bitcoin', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/bitcoin/scan/tx',
        request,
        expect.any(Object)
      );
      expect(result.risk_level).toBe('high');
    });
  });

  describe('scanEip712', () => {
    it('should POST to /ledger/{family}/scan/eip-712 with the request body', async () => {
      const request: LedgerEIP712Request = {
        signer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        typedData: {
          domain: {
            name: 'MyDApp',
            version: '1',
            chainId: 1,
            verifyingContract: '0x0000000000000000000000000000000000000000',
          },
          message: { maker: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
          primaryType: 'Order',
          types: {
            EIP712Domain: [{ name: 'name', type: 'string' }],
            Order: [{ name: 'maker', type: 'address' }],
          },
        },
        chain: 1,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        data: { is_safe: true, risk_level: 'safe', risks: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanEip712('ethereum', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/eip-712',
        request,
        expect.any(Object)
      );
      expect(result.is_safe).toBe(true);
    });

    it('should pass timeout and signal options through', async () => {
      const request: LedgerEIP712Request = {
        signer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        typedData: {
          domain: { chainId: 1 },
          message: {},
          primaryType: 'Order',
          types: {},
        },
        chain: 1,
      };
      const controller = new AbortController();

      mockHttpClient.post.mockResolvedValueOnce({
        data: { is_safe: true, risk_level: 'safe', risks: [] },
        status: 200,
        headers: new Headers(),
      });

      await ledger.scanEip712('ethereum', request, {
        timeout: 3000,
        signal: controller.signal,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/ledger/ethereum/scan/eip-712', request, {
        timeout: 3000,
        signal: controller.signal,
      });
    });
  });
});
