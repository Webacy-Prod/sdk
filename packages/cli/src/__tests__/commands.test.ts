import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chain } from '@webacy-xyz/sdk-core';

const addressesAnalyze = vi.fn();
const urlCheck = vi.fn();
const tokensTrending = vi.fn();

vi.mock('../context', () => ({
  buildClients: () => ({
    threat: {
      addresses: { analyze: addressesAnalyze },
      url: { check: urlCheck },
    },
    trading: {
      tokens: { getTrending: tokensTrending },
    },
  }),
}));

describe('CLI command wiring', () => {
  beforeEach(() => {
    addressesAnalyze.mockReset();
    urlCheck.mockReset();
    tokensTrending.mockReset();
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  it('wires "addresses analyze" with --chain flag', async () => {
    addressesAnalyze.mockResolvedValueOnce({ overallRisk: 42 });

    const { buildProgram } = await import('../cli');
    await buildProgram().parseAsync([
      'node',
      'webacy',
      '--api-key',
      'test-key',
      'addresses',
      'analyze',
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '--chain',
      'eth',
    ]);

    expect(addressesAnalyze).toHaveBeenCalledTimes(1);
    expect(addressesAnalyze).toHaveBeenCalledWith('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', {
      chain: Chain.ETH,
    });
  });

  it('wires "url check" without chain', async () => {
    urlCheck.mockResolvedValueOnce({ prediction: 'benign' });

    const { buildProgram } = await import('../cli');
    await buildProgram().parseAsync([
      'node',
      'webacy',
      '--api-key',
      'test-key',
      'url',
      'check',
      'https://example.com',
    ]);

    expect(urlCheck).toHaveBeenCalledWith('https://example.com');
  });

  it('wires "tokens trending" with --chain and --limit', async () => {
    tokensTrending.mockResolvedValueOnce({ tokens: [] });

    const { buildProgram } = await import('../cli');
    await buildProgram().parseAsync([
      'node',
      'webacy',
      '--api-key',
      'test-key',
      'tokens',
      'trending',
      '--chain',
      'sol',
      '--limit',
      '5',
    ]);

    expect(tokensTrending).toHaveBeenCalledWith({ chain: Chain.SOL, limit: 5 });
  });
});
