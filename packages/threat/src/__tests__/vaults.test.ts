import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VaultsResource } from '../resources/vaults';
import { VaultEventCategory, VaultEventMechanism } from '../types/vault';
import type { VaultDeployment, VaultListResponse } from '../types/vault';
import { Chain, ValidationError, HttpClient } from '@webacy-xyz/sdk-core';

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

describe('VaultsResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let vaults: VaultsResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    vaults = new VaultsResource(mockHttpClient as unknown as HttpClient);
  });

  describe('list', () => {
    it('should call /vaults with no params when none provided', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, filtered_tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await vaults.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/vaults', expect.any(Object));
    });

    it('should pass all filter params correctly', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, filtered_tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      await vaults.list({
        page: 2,
        pageSize: 100,
        chain: Chain.ETH,
        tier: 'high',
        underlying: 'USDC',
        protocol: 'morpho',
        version: 'v2',
        minTvl: 1000000,
        underlyingRisk: 'battle_tested',
        withdrawalRisk: 'illiquid',
        minScore: 20,
        maxScore: 80,
        contractType: 'erc4626_vault',
        attentionNeeded: true,
        riskFlags: 'vault-high-looping,vault-upgradeable',
        riskFlagsMode: 'any',
        q: 'morpho',
        sort: 'score_desc',
      });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/vaults?');
      expect(calledUrl).toContain('chain=eth');
      expect(calledUrl).toContain('tier=high');
      expect(calledUrl).toContain('underlying=USDC');
      expect(calledUrl).toContain('protocol=morpho');
      expect(calledUrl).toContain('version=v2');
      expect(calledUrl).toContain('minTvl=1000000');
      expect(calledUrl).toContain('underlyingRisk=battle_tested');
      expect(calledUrl).toContain('withdrawalRisk=illiquid');
      expect(calledUrl).toContain('minScore=20');
      expect(calledUrl).toContain('maxScore=80');
      expect(calledUrl).toContain('contractType=erc4626_vault');
      expect(calledUrl).toContain('attentionNeeded=true');
      expect(calledUrl).toContain('riskFlags=vault-high-looping%2Cvault-upgradeable');
      expect(calledUrl).toContain('riskFlagsMode=any');
      expect(calledUrl).toContain('q=morpho');
      expect(calledUrl).toContain('sort=score_desc');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('pageSize=100');
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { items: [], pagination: {}, aggregates: {}, filtered_tier_counts: {}, stale: false },
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await vaults.list({ timeout: 30000, signal: controller.signal });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000, signal: controller.signal })
      );
    });

    it('should expose share-class grouping fields on item metadata', async () => {
      // Trimmed GET /vaults?q=jaaa response — a grouped Centrifuge RWA fund.
      const jaaaDeployment: VaultDeployment = {
        chain: 'avax',
        address: '0x1121000000000000000000000000000000000000',
        // Mislabeled upstream (reports the share-token symbol, not the deposit asset).
        deposit_asset_symbol: 'JAAA',
        // Reliable discriminator between same-chain deployments.
        deposit_asset_address: '0xb97e00000000000000000000000000000000000',
        tvl_usd: 684033691.77,
        vault_score: 4.1,
        tier: 'low',
        tokens: [],
        token_enrichment_failed: false,
      };

      const groupedItem = {
        metadata: {
          name: 'Janus Henderson Anemoy AAA CLO Fund',
          symbol: 'JAAA',
          chain: 'avax',
          share_class_id: '0x00010000000000070000000000000001',
          chains: ['avax', 'base', 'eth', 'pharos', 'monad', 'bsc', 'arb'],
          deployments: [jaaaDeployment],
        },
        risk: {},
        tokens: [],
      };

      const nonRwaItem = {
        metadata: {
          name: 'Morpho USDC Vault',
          symbol: 'mUSDC',
          chain: 'eth',
          // Non-RWA vaults have no grouping key and a single deployment.
          share_class_id: null,
          chains: ['eth'],
          deployments: [
            {
              chain: 'eth',
              address: '0x2222000000000000000000000000000000000000',
              deposit_asset_symbol: 'USDC',
              deposit_asset_address: '0xa0b8000000000000000000000000000000000000',
              tvl_usd: 1000000,
              vault_score: 2.5,
              tier: 'low',
              tokens: [],
              token_enrichment_failed: false,
            },
          ],
        },
        risk: {},
        tokens: [],
      };

      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          items: [groupedItem, nonRwaItem],
          pagination: {},
          aggregates: {},
          filtered_tier_counts: {},
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      const result = (await vaults.list({ q: 'jaaa' })) as VaultListResponse;

      const grouped = result.items[0].metadata;
      expect(grouped.share_class_id).toBe('0x00010000000000070000000000000001');
      expect(grouped.chains).toEqual(['avax', 'base', 'eth', 'pharos', 'monad', 'bsc', 'arb']);
      // Highest-risk chain is first in the deduped list.
      expect(grouped.chains[0]).toBe('avax');
      expect(grouped.deployments).toHaveLength(1);

      const deployment = grouped.deployments[0];
      // deposit_asset_address is the discriminator, not deposit_asset_symbol.
      expect(deployment.deposit_asset_address).toBe('0xb97e00000000000000000000000000000000000');
      expect(deployment.tier).toBe('low');
      expect(deployment.tokens).toEqual([]);
      expect(deployment.token_enrichment_failed).toBe(false);

      // Non-RWA vault: null grouping key, single deployment.
      expect(result.items[1].metadata.share_class_id).toBeNull();
      expect(result.items[1].metadata.deployments).toHaveLength(1);
    });
  });

  describe('listCursor', () => {
    it('should include cursor param and return cursor response', async () => {
      const mockData = {
        request_id: 'req-123',
        schema_version: '1.0',
        items: [],
        next_cursor: 'next-abc',
        count: 0,
        aggregates: {},
        filtered_tier_counts: {},
        stale: false,
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.listCursor({ cursor: 'cursor-abc', limit: 50 });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('cursor=cursor-abc');
      expect(calledUrl).toContain('limit=50');
      expect(result.request_id).toBe('req-123');
      expect(result.next_cursor).toBe('next-abc');
    });

    it('should include shared filter params alongside cursor', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          request_id: '',
          schema_version: '',
          items: [],
          next_cursor: null,
          count: 0,
          aggregates: {},
          filtered_tier_counts: {},
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      await vaults.listCursor({
        cursor: 'cursor-abc',
        chain: Chain.ETH,
        protocol: 'morpho',
        tier: 'high',
      });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('cursor=cursor-abc');
      expect(calledUrl).toContain('chain=eth');
      expect(calledUrl).toContain('protocol=morpho');
      expect(calledUrl).toContain('tier=high');
    });
  });

  describe('listEvents', () => {
    it('should call /vaults/events with no params when none provided', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      await vaults.listEvents();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/vaults/events', expect.any(Object));
    });

    it('should pass category and mechanism filters', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      await vaults.listEvents({
        category: VaultEventCategory.VAULT_CONTRACT,
        mechanism: VaultEventMechanism.ORACLE_MANIPULATION,
      });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/vaults/events?');
      expect(calledUrl).toContain('category=vault_contract');
      expect(calledUrl).toContain('mechanism=oracle_manipulation');
    });

    it('should return response data', async () => {
      const mockData = {
        generated_at: '2026-04-01T00:00:00Z',
        stale: false,
        count: 1,
        events: [
          {
            id: 'evt-1',
            name: 'Test exploit',
            protocol: 'morpho',
            vault_symbol: 'mwUSDC',
            vault_address: '0xabc',
            chain: 'eth',
            event_type: 'exploit',
            start: '2026-01-01',
            end: null,
            loss_usd: 1000000,
            description: 'test',
            category: 'vault_contract',
            mechanism: 'oracle_manipulation',
            maps_to_sub_scores: ['price'],
            affected_assets: ['USDC'],
            affected_chains: ['eth'],
            reference_url: null,
            direct_vault_exploit: true,
            verified_vault_key: 'eth:0xabc',
          },
        ],
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.listEvents();

      expect(result.count).toBe(1);
      expect(result.events[0].category).toBe('vault_contract');
      expect(result.events[0].mechanism).toBe('oracle_manipulation');
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await vaults.listEvents({ timeout: 15000, signal: controller.signal });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000, signal: controller.signal })
      );
    });

    it('should normalize degraded response missing generated_at and count', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { stale: true, events: [] },
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.listEvents();

      expect(result).toEqual({
        generated_at: null,
        stale: true,
        count: 0,
        events: [],
      });
    });
  });

  describe('listEventsForAddress', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    it('should call /vaults/:address/events with required chain', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      await vaults.listEventsForAddress(address, { chain: Chain.ETH });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toBe(`/vaults/${encodeURIComponent(address)}/events?chain=eth`);
    });

    it('should include category and mechanism filters', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      await vaults.listEventsForAddress(address, {
        chain: Chain.ETH,
        category: VaultEventCategory.VAULT_CONTRACT,
        mechanism: VaultEventMechanism.ORACLE_MANIPULATION,
      });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain(`/vaults/${encodeURIComponent(address)}/events?`);
      expect(calledUrl).toContain('chain=eth');
      expect(calledUrl).toContain('category=vault_contract');
      expect(calledUrl).toContain('mechanism=oracle_manipulation');
    });

    it('should throw ValidationError for invalid address', async () => {
      await expect(vaults.listEventsForAddress('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { generated_at: null, stale: false, count: 0, events: [] },
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await vaults.listEventsForAddress(address, {
        chain: Chain.ETH,
        timeout: 15000,
        signal: controller.signal,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000, signal: controller.signal })
      );
    });
  });

  describe('get', () => {
    it('should call /vaults/:address with required chain param', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          metadata: {},
          risk: {},
          tokens: [],
          looping_markets: [],
          vault_composition: [],
          lst_collateral_markets: null,
          morpho: null,
          webacy: {},
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      await vaults.get(address, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/vaults/${encodeURIComponent(address)}?chain=eth`,
        expect.any(Object)
      );
    });

    it('should throw ValidationError for invalid address', async () => {
      await expect(vaults.get('invalid', { chain: Chain.ETH })).rejects.toThrow(ValidationError);
    });

    it('should return response data', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const mockData = {
        metadata: { address, chain: 'eth', name: 'Test Vault', protocol: 'morpho' },
        risk: { score: 45, count: 3, medium: 2, high: 1, overallRisk: 45, issues: [] },
        tokens: [],
        looping_markets: [],
        vault_composition: [],
        lst_collateral_markets: null,
        morpho: { liquidity_usd: 5000000 },
        webacy: { findings: [] },
        stale: false,
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.get(address, { chain: Chain.ETH });

      expect(result.metadata.protocol).toBe('morpho');
      expect(result.risk.score).toBe(45);
      expect(result.morpho?.liquidity_usd).toBe(5000000);
      expect(result.stale).toBe(false);
    });

    it('should pass timeout to httpClient', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          metadata: {},
          risk: {},
          tokens: [],
          looping_markets: [],
          vault_composition: [],
          lst_collateral_markets: null,
          morpho: null,
          webacy: {},
          stale: false,
        },
        status: 200,
        headers: new Headers(),
      });

      await vaults.get(address, { chain: Chain.ETH, timeout: 60000 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 60000 })
      );
    });
  });

  describe('getTvlHistory', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const emptyResponse = {
      schema_version: 's3',
      stale: true,
      stale_reason: 'no_samples_yet',
      days: 30,
      count: 0,
      filtered_count: 0,
      from: null,
      to: null,
      latest: null,
      series: [],
    };

    it('should call /vaults/:address/tvl-history with chain only when range omitted', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getTvlHistory(address, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/vaults/${encodeURIComponent(address)}/tvl-history?chain=eth`,
        expect.any(Object)
      );
    });

    it('should include range when supplied', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getTvlHistory(address, { chain: Chain.ETH, range: '7d' });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toBe(
        `/vaults/${encodeURIComponent(address)}/tvl-history?chain=eth&range=7d`
      );
    });

    it('should serialize includeFlagged=true to the query string', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getTvlHistory(address, { chain: Chain.ETH, includeFlagged: true });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toBe(
        `/vaults/${encodeURIComponent(address)}/tvl-history?chain=eth&includeFlagged=true`
      );
    });

    it('should omit includeFlagged when false or undefined', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getTvlHistory(address, { chain: Chain.ETH, includeFlagged: false });
      let calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('includeFlagged');

      await vaults.getTvlHistory(address, { chain: Chain.ETH });
      calledUrl = mockHttpClient.get.mock.calls[1][0] as string;
      expect(calledUrl).not.toContain('includeFlagged');
    });

    it('should throw ValidationError for invalid address', async () => {
      await expect(vaults.getTvlHistory('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should pass through the response envelope unchanged', async () => {
      const mockData = {
        schema_version: 's3',
        stale: false,
        stale_reason: 'fresh',
        days: 7,
        count: 2,
        filtered_count: 0,
        from: '2026-04-21T00:00:00.000Z',
        to: '2026-04-22T00:00:00.000Z',
        latest: {
          ts: '2026-04-22T00:00:00.000Z',
          tvl_usd: 2514259979.56,
          quality_flag: 'ok',
        },
        series: [
          {
            ts: '2026-04-21T00:00:00.000Z',
            tvl_usd: 3122465748.18,
            quality_flag: 'ok',
          },
          {
            ts: '2026-04-22T00:00:00.000Z',
            tvl_usd: 2514259979.56,
            quality_flag: 'ok',
          },
        ],
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getTvlHistory(address, {
        chain: Chain.ETH,
        range: '7d',
      });

      expect(result).toEqual(mockData);
      expect(result.schema_version).toBe('s3');
      expect(result.stale_reason).toBe('fresh');
      expect(result.filtered_count).toBe(0);
      expect(result.latest?.quality_flag).toBe('ok');
      for (const point of result.series) {
        expect(point.quality_flag).toBe('ok');
      }
    });

    it('should surface filtered_count and quality_flag variants when includeFlagged=true', async () => {
      const mockData = {
        schema_version: 's3',
        stale: false,
        stale_reason: 'fresh',
        days: 7,
        count: 3,
        filtered_count: 0,
        from: '2026-04-20T00:00:00.000Z',
        to: '2026-04-22T00:00:00.000Z',
        latest: {
          ts: '2026-04-22T00:00:00.000Z',
          tvl_usd: 9_000_000,
          quality_flag: 'spike',
        },
        series: [
          { ts: '2026-04-20T00:00:00.000Z', tvl_usd: 1_000_000, quality_flag: 'ok' },
          { ts: '2026-04-21T00:00:00.000Z', tvl_usd: 1_050_000, quality_flag: 'capped' },
          { ts: '2026-04-22T00:00:00.000Z', tvl_usd: 9_000_000, quality_flag: 'spike' },
        ],
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getTvlHistory(address, {
        chain: Chain.ETH,
        includeFlagged: true,
      });

      expect(result.filtered_count).toBe(0);
      expect(result.series.map((p) => p.quality_flag)).toEqual(['ok', 'capped', 'spike']);
      expect(result.latest?.quality_flag).toBe('spike');
    });

    it.each([
      ['fresh', false],
      ['pipeline_lag', true],
      ['all_filtered', true],
      ['no_samples_yet', true],
    ] as const)('should round-trip stale_reason=%s', async (reason, stale) => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { ...emptyResponse, stale, stale_reason: reason },
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getTvlHistory(address, { chain: Chain.ETH });

      expect(result.stale_reason).toBe(reason);
      expect(result.stale).toBe(stale);
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await vaults.getTvlHistory(address, {
        chain: Chain.ETH,
        timeout: 15000,
        signal: controller.signal,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000, signal: controller.signal })
      );
    });
  });

  describe('getSharePriceHistory', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const emptyResponse = {
      schema_version: 's3',
      stale: true,
      stale_reason: 'no_samples_yet',
      days: 30,
      count: 0,
      filtered_count: 0,
      from: null,
      to: null,
      latest: null,
      series: [],
    };

    it('should call /vaults/:address/share-price-history with chain only when range omitted', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getSharePriceHistory(address, { chain: Chain.ETH });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/vaults/${encodeURIComponent(address)}/share-price-history?chain=eth`,
        expect.any(Object)
      );
    });

    it('should include range when supplied', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getSharePriceHistory(address, { chain: Chain.ETH, range: '60d' });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toBe(
        `/vaults/${encodeURIComponent(address)}/share-price-history?chain=eth&range=60d`
      );
    });

    it('should serialize includeFlagged=true to the query string', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getSharePriceHistory(address, { chain: Chain.ETH, includeFlagged: true });

      const calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toBe(
        `/vaults/${encodeURIComponent(address)}/share-price-history?chain=eth&includeFlagged=true`
      );
    });

    it('should omit includeFlagged when false or undefined', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      await vaults.getSharePriceHistory(address, { chain: Chain.ETH, includeFlagged: false });
      let calledUrl = mockHttpClient.get.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('includeFlagged');

      await vaults.getSharePriceHistory(address, { chain: Chain.ETH });
      calledUrl = mockHttpClient.get.mock.calls[1][0] as string;
      expect(calledUrl).not.toContain('includeFlagged');
    });

    it('should throw ValidationError for invalid address', async () => {
      await expect(vaults.getSharePriceHistory('invalid', { chain: Chain.ETH })).rejects.toThrow(
        ValidationError
      );
    });

    it('should pass through the response envelope including latest aggregate', async () => {
      const mockData = {
        schema_version: 's3',
        stale: true,
        stale_reason: 'pipeline_lag',
        days: 7,
        count: 5,
        filtered_count: 0,
        from: '2026-04-23T00:00:00.000Z',
        to: '2026-04-27T00:00:00.000Z',
        latest: {
          ts: '2026-04-27T00:00:00.000Z',
          share_price_usd: 1.229126764047821,
          apy_trailing_7d: 0.05067916458779709,
          apy_trailing_30d: null,
          quality_flag: 'ok',
        },
        series: [
          {
            ts: '2026-04-23T00:00:00.000Z',
            share_price_usd: 1.2284373128041446,
            apy_trailing_7d: 0.0831246611487193,
            quality_flag: 'ok',
          },
          {
            ts: '2026-04-27T00:00:00.000Z',
            share_price_usd: 1.229126764047821,
            apy_trailing_7d: 0.05067916458779709,
            quality_flag: 'ok',
          },
        ],
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getSharePriceHistory(address, {
        chain: Chain.ETH,
        range: '7d',
      });

      expect(result).toEqual(mockData);
      expect(result.schema_version).toBe('s3');
      expect(result.stale_reason).toBe('pipeline_lag');
      expect(result.filtered_count).toBe(0);
      expect(result.latest?.apy_trailing_30d).toBeNull();
      expect(result.latest?.quality_flag).toBe('ok');
      expect(result.series[0].apy_trailing_7d).toBe(0.0831246611487193);
      for (const point of result.series) {
        expect(point.quality_flag).toBe('ok');
      }
    });

    it('should surface flagged quality variants when includeFlagged=true', async () => {
      const mockData = {
        schema_version: 's3',
        stale: false,
        stale_reason: 'fresh',
        days: 7,
        count: 3,
        filtered_count: 0,
        from: '2026-04-20T00:00:00.000Z',
        to: '2026-04-22T00:00:00.000Z',
        latest: {
          ts: '2026-04-22T00:00:00.000Z',
          share_price_usd: 1.5,
          apy_trailing_7d: null,
          apy_trailing_30d: null,
          quality_flag: 'diverged',
        },
        series: [
          {
            ts: '2026-04-20T00:00:00.000Z',
            share_price_usd: 1.1,
            apy_trailing_7d: null,
            quality_flag: 'ok',
          },
          {
            ts: '2026-04-21T00:00:00.000Z',
            share_price_usd: 1.2,
            apy_trailing_7d: null,
            quality_flag: 'capped',
          },
          {
            ts: '2026-04-22T00:00:00.000Z',
            share_price_usd: 1.5,
            apy_trailing_7d: null,
            quality_flag: 'diverged',
          },
        ],
      };
      mockHttpClient.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getSharePriceHistory(address, {
        chain: Chain.ETH,
        includeFlagged: true,
      });

      expect(result.filtered_count).toBe(0);
      expect(result.series.map((p) => p.quality_flag)).toEqual(['ok', 'capped', 'diverged']);
      expect(result.latest?.quality_flag).toBe('diverged');
    });

    it.each([
      ['fresh', false],
      ['pipeline_lag', true],
      ['all_filtered', true],
      ['no_samples_yet', true],
    ] as const)('should round-trip stale_reason=%s', async (reason, stale) => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: { ...emptyResponse, stale, stale_reason: reason },
        status: 200,
        headers: new Headers(),
      });

      const result = await vaults.getSharePriceHistory(address, { chain: Chain.ETH });

      expect(result.stale_reason).toBe(reason);
      expect(result.stale).toBe(stale);
    });

    it('should pass timeout and signal to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: emptyResponse,
        status: 200,
        headers: new Headers(),
      });

      const controller = new AbortController();
      await vaults.getSharePriceHistory(address, {
        chain: Chain.ETH,
        timeout: 15000,
        signal: controller.signal,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 15000, signal: controller.signal })
      );
    });
  });
});
