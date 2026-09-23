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

// Shape of the API response (same envelope as /scan/{from}/transactions)
const txScanResponse = {
  public_key_id: 'f707d252-4475-4afd-8b8d-6c4893624aa7',
  descriptor: '0x0101090201',
  block: null,
  timestamp: '2026-09-23T14:08:50.775Z',
  simulation: [
    {
      partyRisk: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', high: 0, medium: 0 },
      counterpartyRisk: {
        address: '0xe7D13137923142A0424771E1778865b88752B3c7',
        overallRisk: 100,
        high: 1,
        medium: 0,
        issues: [{ score: 100, tags: [{ key: 'HACK', name: 'Hack Related', severity: 10 }] }],
      },
      assetRisk: { address: null },
      txData: {
        changeType: 'TRANSFER',
        assetType: 'NATIVE',
        rawAmount: '10000000000000000',
        partyAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        counterpartyAddress: '0xe7D13137923142A0424771E1778865b88752B3c7',
        assetAddress: null,
        source: 'debug_trace',
      },
    },
  ],
};

const eip712ScanResponse = {
  public_key_id: 'f707d252-4475-4afd-8b8d-6c4893624aa7',
  descriptor: '0x0101090201',
  block: null,
  timestamp: '2026-09-23T14:09:30.085Z',
  simulation: {
    counterpartyRisk: {
      address: '0x84672cc56b6dad30cfa5f9751d9ccae6c39e29cd',
      overallRisk: 100,
      high: 1,
      medium: 1,
      allAddressesChecked: ['0x84672cc56b6dad30cfa5f9751d9ccae6c39e29cd'],
    },
    domainRisk: { riskLevel: 'unknown', description: 'Inconclusive.' },
  },
};

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
        data: txScanResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanTransaction('ethereum', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/tx',
        request,
        expect.any(Object)
      );
      expect(result.descriptor).toBe('0x0101090201');
      expect(result.simulation).toHaveLength(1);
      expect(result.simulation[0].counterpartyRisk.high).toBe(1);
      expect(result.simulation[0].txData.changeType).toBe('TRANSFER');
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
        data: txScanResponse,
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

    it('should include refreshCache in the query when provided', async () => {
      const request: LedgerScanRequest = {
        tx: { from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', raw: '0xabc123' },
        chain: 1,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        data: txScanResponse,
        status: 200,
        headers: new Headers(),
      });

      await ledger.scanTransaction('ethereum', request, { refreshCache: true });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/tx?refreshCache=true',
        request,
        expect.any(Object)
      );
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
        data: { ...txScanResponse, simulation: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanTransaction('bitcoin', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/bitcoin/scan/tx',
        request,
        expect.any(Object)
      );
      expect(result.simulation).toEqual([]);
    });
  });

  describe('scanEip712', () => {
    const request: LedgerEIP712Request = {
      msg: {
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        data: {
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
      },
      domain: 'app.mydapp.com',
    };

    it('should POST to /ledger/{family}/scan/eip-712 with the msg envelope', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: eip712ScanResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanEip712('ethereum', request);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/eip-712',
        request,
        expect.any(Object)
      );
      expect(result.simulation.counterpartyRisk?.high).toBe(1);
      expect(result.simulation.domainRisk?.riskLevel).toBe('unknown');
    });

    it('should pass timeout and signal options through', async () => {
      const controller = new AbortController();

      mockHttpClient.post.mockResolvedValueOnce({
        data: eip712ScanResponse,
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
