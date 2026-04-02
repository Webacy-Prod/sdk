import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RwaResource } from '../resources/rwa';
import { Chain, HttpClient } from '@webacy-xyz/sdk-core';

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

describe('RwaResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let rwa: RwaResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    rwa = new RwaResource(mockHttpClient as unknown as HttpClient);
  });

  describe('list', () => {
    it('should call /rwa with no params when none provided', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await rwa.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/rwa', expect.any(Object));
    });

    it('should pass all filter params correctly', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await rwa.list({
        chain: Chain.ETH,
        denomination: 'USD',
        tier: 'critical',
        minScore: 50,
        maxScore: 100,
        minMcap: 1000000,
        liquidity: 'high',
        q: 'USDC',
        sort: 'score',
        order: 'desc',
        showAll: true,
        page: 2,
        pageSize: 25,
      });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/rwa?');
      expect(calledUrl).toContain('chain=eth');
      expect(calledUrl).toContain('denomination=USD');
      expect(calledUrl).toContain('tier=critical');
      expect(calledUrl).toContain('minScore=50');
      expect(calledUrl).toContain('maxScore=100');
      expect(calledUrl).toContain('minMcap=1000000');
      expect(calledUrl).toContain('liquidity=high');
      expect(calledUrl).toContain('q=USDC');
      expect(calledUrl).toContain('sort=score');
      expect(calledUrl).toContain('order=desc');
      expect(calledUrl).toContain('showAll=true');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('pageSize=25');
    });

    it('should join tags array to comma-separated string', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await rwa.list({ tags: ['gold', 'rwa', 'vault'] });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('tags=gold%2Crwa%2Cvault');
    });

    it('should not include tags param when empty array', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await rwa.list({ tags: [] });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('tags');
    });

    it('should pass collapsedOnly param', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await rwa.list({ collapsedOnly: true });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('collapsedOnly=true');
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await rwa.list({ timeout: 30000, signal: controller.signal });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000, signal: controller.signal })
      );
    });
  });

  describe('get', () => {
    it('should call /rwa/:address with encoded address', async () => {
      const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          token: {},
          snapshot: {},
          risk: null,
          history: {},
          depegEvents: [],
          events: [],
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      await rwa.get(address);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/rwa/${encodeURIComponent(address)}`,
        expect.any(Object)
      );
    });

    it('should pass chain and hours query params', async () => {
      const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          token: {},
          snapshot: {},
          risk: null,
          history: {},
          depegEvents: [],
          events: [],
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      await rwa.get(address, { chain: Chain.ETH, hours: 72 });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain(`/rwa/${encodeURIComponent(address)}?`);
      expect(calledUrl).toContain('chain=eth');
      expect(calledUrl).toContain('hours=72');
    });

    it('should not require chain or address validation', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          token: {},
          snapshot: {},
          risk: null,
          history: {},
          depegEvents: [],
          events: [],
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      // Should not throw even with a non-EVM address
      await expect(rwa.get('some-non-evm-address')).resolves.toBeDefined();
    });

    it('should return response data', async () => {
      const address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const mockData = {
        token: { address, chain: 'eth', symbol: 'USDC' },
        snapshot: { score: 5, tier: 'ok' },
        risk: null,
        history: { hours: 24, series: [], consecutive_days_below_peg: null },
        depegEvents: [],
        events: [],
        stale: false,
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await rwa.get(address);

      expect(result.token.symbol).toBe('USDC');
      expect(result.snapshot.tier).toBe('ok');
      expect(result.stale).toBe(false);
    });
  });
});
