import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScanResource } from '../resources/scan';
import { Chain, ValidationError, HttpClient } from '@webacy-xyz/sdk-core';
import type { ScanTransactionRequest, ScanEIP712Request } from '../types';

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

describe('ScanResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let scan: ScanResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    scan = new ScanResource(mockHttpClient as unknown as HttpClient);
  });

  describe('scanTransaction', () => {
    const validRequest: ScanTransactionRequest = {
      tx: { from: '0xSigner', raw: '0x02f8...' },
      chain: 1,
    };

    it('should throw ValidationError for empty address', async () => {
      await expect(scan.scanTransaction('', validRequest)).rejects.toThrow(ValidationError);
      await expect(scan.scanTransaction('   ', validRequest)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing tx data', async () => {
      await expect(scan.scanTransaction('0xSigner', {} as ScanTransactionRequest)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for missing tx.from', async () => {
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '', raw: '0x02f8...' },
          chain: 1,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing tx.raw', async () => {
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '0xSigner', raw: '' },
          chain: 1,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid chain ID', async () => {
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '0xSigner', raw: '0x02f8...' },
          chain: 999 as 1,
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '0xSigner', raw: '0x02f8...' },
          chain: 999 as 1,
        })
      ).rejects.toThrow('Invalid chain ID');
    });

    it('should throw ValidationError for mismatched signer address', async () => {
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '0xDifferentAddress', raw: '0x02f8...' },
          chain: 1,
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        scan.scanTransaction('0xSigner', {
          tx: { from: '0xDifferentAddress', raw: '0x02f8...' },
          chain: 1,
        })
      ).rejects.toThrow('Signer address must match tx.from');
    });

    it('should make API call with valid request', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { riskLevel: 'low', warnings: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await scan.scanTransaction('0xSigner', validRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/scan/0xSigner/transactions',
        validRequest,
        expect.any(Object)
      );
      expect(result.riskLevel).toBe('low');
    });

    it('should include refreshCache when provided', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { riskLevel: 'low', warnings: [] },
        status: 200,
        headers: new Headers(),
      });

      await scan.scanTransaction('0xSigner', validRequest, { refreshCache: true });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/scan/0xSigner/transactions?refreshCache=true',
        validRequest,
        expect.any(Object)
      );
    });

    it('should support all valid chain IDs', async () => {
      const validChainIds = [1, 56, 137, 10, 42161, 8453] as const;

      for (const chainId of validChainIds) {
        mockHttpClient.post.mockResolvedValueOnce({
          data: { riskLevel: 'low', warnings: [] },
          status: 200,
          headers: new Headers(),
        });

        await scan.scanTransaction('0xSigner', {
          tx: { from: '0xSigner', raw: '0x02f8...' },
          chain: chainId,
        });

        expect(mockHttpClient.post).toHaveBeenCalled();
      }
    });
  });

  describe('scanEip712', () => {
    const validRequest: ScanEIP712Request = {
      msg: {
        from: '0xSigner',
        data: {
          types: {
            EIP712Domain: [{ name: 'name', type: 'string' }],
            Permit: [{ name: 'owner', type: 'address' }],
          },
          primaryType: 'Permit',
          domain: { chainId: 1 },
          message: { owner: '0xOwner' },
        },
      },
    };

    it('should throw ValidationError for empty address', async () => {
      await expect(scan.scanEip712('', validRequest)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing msg data', async () => {
      await expect(scan.scanEip712('0xSigner', {} as ScanEIP712Request)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for missing msg.from', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '',
            data: validRequest.msg.data,
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing types', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              types: undefined as unknown as Record<string, Array<{ name: string; type: string }>>,
            },
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing primaryType', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              primaryType: '',
            },
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing domain', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              domain: undefined as unknown as { chainId: number },
            },
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing domain.chainId', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              domain: {} as { chainId: number },
            },
          },
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid domain.chainId', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              domain: { chainId: 999 },
            },
          },
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xSigner',
            data: {
              ...validRequest.msg.data,
              domain: { chainId: 999 },
            },
          },
        })
      ).rejects.toThrow('Invalid chain ID in EIP-712 domain');
    });

    it('should throw ValidationError for mismatched signer address', async () => {
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xDifferentAddress',
            data: validRequest.msg.data,
          },
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        scan.scanEip712('0xSigner', {
          msg: {
            from: '0xDifferentAddress',
            data: validRequest.msg.data,
          },
        })
      ).rejects.toThrow('Signer address must match msg.from');
    });

    it('should make API call with valid request', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { riskLevel: 'low', warnings: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await scan.scanEip712('0xSigner', validRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/scan/0xSigner/eip712',
        validRequest,
        expect.any(Object)
      );
      expect(result.riskLevel).toBe('low');
    });

    it('should include refreshCache when provided', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { riskLevel: 'low', warnings: [] },
        status: 200,
        headers: new Headers(),
      });

      await scan.scanEip712('0xSigner', validRequest, { refreshCache: true });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/scan/0xSigner/eip712?refreshCache=true',
        validRequest,
        expect.any(Object)
      );
    });
  });

  describe('startRiskScan', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(scan.startRiskScan('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(scan.startRiskScan(validAddress)).rejects.toThrow(ValidationError);
      await expect(scan.startRiskScan(validAddress)).rejects.toThrow('Chain is required');
    });

    it('should make POST to /scan/{address} with chain param', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.post.mockResolvedValueOnce({
        data: { success: true, status: 'queued' },
        status: 200,
        headers: new Headers(),
      });

      const result = await scan.startRiskScan(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/scan/${encodeURIComponent(validAddress)}?chain=eth`,
        undefined,
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    it('should use default chain when provided', async () => {
      const scanWithDefault = new ScanResource(mockHttpClient as unknown as HttpClient, Chain.ETH);
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: new Headers(),
      });

      await scanWithDefault.startRiskScan(validAddress);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('chain=eth'),
        undefined,
        expect.any(Object)
      );
    });

    it('should pass timeout to httpClient', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: new Headers(),
      });

      await scan.startRiskScan(validAddress, { chain: Chain.ETH, timeout: 30000 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        undefined,
        expect.objectContaining({ timeout: 30000 })
      );
    });
  });

  describe('getRiskScanStatus', () => {
    it('should throw ValidationError for invalid address', async () => {
      await expect(scan.getRiskScanStatus('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when chain is not provided and no default is set', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      await expect(scan.getRiskScanStatus(validAddress)).rejects.toThrow(ValidationError);
    });

    it('should make GET to /status/{address} with chain param', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { status: 'complete', score: 42 },
        status: 200,
        headers: new Headers(),
      });

      const result = await scan.getRiskScanStatus(validAddress, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/status/${encodeURIComponent(validAddress)}?chain=eth`,
        expect.any(Object)
      );
      expect(result.status).toBe('complete');
      expect(result.score).toBe(42);
    });

    it('should pass timeout to httpClient', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: { status: 'pending' },
        status: 200,
        headers: new Headers(),
      });

      await scan.getRiskScanStatus(validAddress, { chain: Chain.ETH, timeout: 15000 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000 })
      );
    });
  });
});
