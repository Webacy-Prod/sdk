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

import {
  ledgerEip712ScanResponse as eip712ScanResponse,
  ledgerTxScanResponse as txScanResponse,
  receiptPlaceholderItem,
} from './fixtures/scan';

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

    it('types the receipt placeholder item of a mined transaction that moved nothing', async () => {
      const request: LedgerScanRequest = {
        tx: {
          from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          raw: '0x' + 'a'.repeat(64),
        },
        chain: 1,
      };

      mockHttpClient.post.mockResolvedValueOnce({
        data: { ...txScanResponse, block: 26041504, simulation: [receiptPlaceholderItem] },
        status: 200,
        headers: new Headers(),
      });

      const result = await ledger.scanTransaction('ethereum', request);

      expect(result.block).toBe(26041504);
      expect(result.simulation[0].txData.changeType).toBeUndefined();
      expect(result.simulation[0].txData.source).toBe('receipt');
      expect(result.simulation[0].assetRisk.address).toBeNull();
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

      // The Ledger route validates every domain field as a non-empty string
      // (chainId included) and does not coerce — the SDK posts it that way.
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/eip-712',
        {
          ...request,
          msg: {
            ...request.msg,
            data: {
              ...request.msg.data,
              domain: {
                name: 'MyDApp',
                version: '1',
                chainId: '1',
                verifyingContract: '0x0000000000000000000000000000000000000000',
              },
            },
          },
        },
        expect.any(Object)
      );
      expect(result.simulation.counterpartyRisk?.high).toBe(1);
      expect(result.simulation.domainRisk?.riskLevel).toBe('unknown');
    });

    it('sends a numeric chainId as the string the Ledger route validates, leaving the rest as given', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: eip712ScanResponse,
        status: 200,
        headers: new Headers(),
      });

      await ledger.scanEip712('ethereum', {
        msg: {
          from: request.msg.from,
          data: { ...request.msg.data, domain: { ...request.msg.data.domain, chainId: 1 } },
        },
      });

      const [, body] = mockHttpClient.post.mock.calls[0];
      expect(body.msg.data.domain).toEqual({
        name: 'MyDApp',
        version: '1',
        chainId: '1',
        verifyingContract: '0x0000000000000000000000000000000000000000',
      });
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/ledger/ethereum/scan/eip-712',
        expect.objectContaining({ domain: 'app.mydapp.com' }),
        {
          timeout: 3000,
          signal: controller.signal,
        }
      );
    });
  });
});
