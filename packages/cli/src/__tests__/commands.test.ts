import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Chain } from '@webacy-xyz/sdk-core';

// Mocks — one fn per subcommand we assert on.
const threat = {
  addresses: {
    analyze: vi.fn(),
    checkSanctioned: vi.fn(),
    checkPoisoning: vi.fn(),
    getQuickProfile: vi.fn(),
    getSummary: vi.fn(),
  },
  contracts: {
    analyze: vi.fn(),
    getSourceCode: vi.fn(),
    getTaxes: vi.fn(),
    analyzeSolidity: vi.fn(),
    getCodeAnalysis: vi.fn(),
    getAudits: vi.fn(),
    getBySymbol: vi.fn(),
  },
  url: { check: vi.fn(), add: vi.fn() },
  wallets: { getTransactions: vi.fn(), getApprovals: vi.fn() },
  ledger: { scanTransaction: vi.fn(), scanEip712: vi.fn() },
  accountTrace: { trace: vi.fn() },
  usage: {
    getCurrent: vi.fn(),
    getUsage: vi.fn(),
    getPlans: vi.fn(),
    getMaxRps: vi.fn(),
  },
  transactions: { analyze: vi.fn() },
  scan: {
    scanTransaction: vi.fn(),
    scanEip712: vi.fn(),
    startRiskScan: vi.fn(),
    getRiskScanStatus: vi.fn(),
  },
  batch: { addresses: vi.fn(), contracts: vi.fn(), transactions: vi.fn() },
  rwa: { list: vi.fn(), get: vi.fn() },
  vaults: {
    list: vi.fn(),
    listCursor: vi.fn(),
    get: vi.fn(),
    listEvents: vi.fn(),
    listEventsForAddress: vi.fn(),
  },
};

const trading = {
  holderAnalysis: { get: vi.fn() },
  tradingLite: { analyze: vi.fn() },
  tokens: {
    getPools: vi.fn(),
    getTrending: vi.fn(),
    getTrendingPools: vi.fn(),
    getToken: vi.fn(),
    getPoolOhlcv: vi.fn(),
  },
};

vi.mock('../context', () => ({
  buildClients: () => ({ threat, trading }),
}));

const allMocks = [
  ...Object.values(threat).flatMap((group) => Object.values(group)),
  ...Object.values(trading).flatMap((group) => Object.values(group)),
];

async function runCli(argv: string[]): Promise<void> {
  const { buildProgram } = await import('../cli');
  await buildProgram().parseAsync(['node', 'webacy', '--api-key', 'test-key', ...argv]);
}

beforeEach(() => {
  allMocks.forEach((m) => m.mockReset().mockResolvedValue({}));
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
});

describe('threat groups', () => {
  const addr = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  it('addresses analyze passes --chain', async () => {
    await runCli(['addresses', 'analyze', addr, '--chain', 'eth']);
    expect(threat.addresses.analyze).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('addresses check-sanctioned', async () => {
    await runCli(['addresses', 'check-sanctioned', addr, '--chain', 'eth']);
    expect(threat.addresses.checkSanctioned).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('addresses quick-profile passes narrowed chain', async () => {
    await runCli(['addresses', 'quick-profile', addr, '--chain', 'eth']);
    expect(threat.addresses.getQuickProfile).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('contracts analyze', async () => {
    await runCli(['contracts', 'analyze', addr, '--chain', 'eth']);
    expect(threat.contracts.analyze).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('contracts by-symbol requires no chain', async () => {
    await runCli(['contracts', 'by-symbol', 'USDC']);
    expect(threat.contracts.getBySymbol).toHaveBeenCalledWith('USDC');
  });

  it('url check', async () => {
    await runCli(['url', 'check', 'https://example.com']);
    expect(threat.url.check).toHaveBeenCalledWith('https://example.com');
  });

  it('wallets approvals', async () => {
    await runCli(['wallets', 'approvals', addr, '--chain', 'eth']);
    expect(threat.wallets.getApprovals).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('account-trace trace with --depth', async () => {
    await runCli(['account-trace', 'trace', addr, '--chain', 'eth', '--depth', '3']);
    expect(threat.accountTrace.trace).toHaveBeenCalledWith(addr, {
      chain: Chain.ETH,
      depth: 3,
    });
  });

  it('usage current', async () => {
    await runCli(['usage', 'current']);
    expect(threat.usage.getCurrent).toHaveBeenCalled();
  });

  it('transactions analyze with chain in subset', async () => {
    await runCli(['transactions', 'analyze', '0xabc', '--chain', 'eth']);
    expect(threat.transactions.analyze).toHaveBeenCalledWith('0xabc', { chain: Chain.ETH });
  });

  it('scan start-risk-scan', async () => {
    await runCli(['scan', 'start-risk-scan', addr, '--chain', 'eth']);
    expect(threat.scan.startRiskScan).toHaveBeenCalledWith(addr, { chain: Chain.ETH });
  });

  it('batch addresses passes chain and parses comma list', async () => {
    await runCli(['batch', 'addresses', '0xaaa,0xbbb', '--chain', 'eth']);
    expect(threat.batch.addresses).toHaveBeenCalledWith({
      addresses: ['0xaaa', '0xbbb'],
      chain: Chain.ETH,
    });
  });

  it('rwa list with --tier', async () => {
    await runCli(['rwa', 'list', '--tier', 'critical']);
    expect(threat.rwa.list).toHaveBeenCalledWith({ tier: 'critical' });
  });

  it('vaults get passes chain', async () => {
    await runCli(['vaults', 'get', '0xvault', '--chain', 'eth']);
    expect(threat.vaults.get).toHaveBeenCalledWith('0xvault', { chain: Chain.ETH });
  });
});

describe('trading groups', () => {
  it('holder-analysis get with --chain', async () => {
    await runCli(['holder-analysis', 'get', 'token', '--chain', 'sol']);
    expect(trading.holderAnalysis.get).toHaveBeenCalledWith('token', { chain: Chain.SOL });
  });

  it('trading-lite analyze with SOL', async () => {
    await runCli(['trading-lite', 'analyze', 'token', '--chain', 'sol']);
    expect(trading.tradingLite.analyze).toHaveBeenCalledWith('token', { chain: Chain.SOL });
  });

  it('tokens trending with --chain and --limit', async () => {
    await runCli(['tokens', 'trending', '--chain', 'sol', '--limit', '5']);
    expect(trading.tokens.getTrending).toHaveBeenCalledWith({ chain: Chain.SOL, limit: 5 });
  });

  it('tokens get passes required chain and metrics-date', async () => {
    await runCli(['tokens', 'get', '0xtoken', '--chain', 'eth', '--metrics-date', '15-01-2024']);
    expect(trading.tokens.getToken).toHaveBeenCalledWith('0xtoken', {
      chain: Chain.ETH,
      metricsDate: '15-01-2024',
    });
  });
});

describe('error paths', () => {
  it('trading-lite analyze rejects non-SOL chain with ValidationError', async () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await runCli(['trading-lite', 'analyze', 'token', '--chain', 'eth']);

    const output = stderr.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('ValidationError');
    expect(output).toContain('trading-lite analyze');
    expect(exit).toHaveBeenCalledWith(1);

    stderr.mockRestore();
    exit.mockRestore();
  });

  it('batch addresses without --chain fails with ValidationError', async () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await runCli(['batch', 'addresses', '0xaaa']);

    const output = stderr.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('ValidationError');
    expect(exit).toHaveBeenCalledWith(1);

    stderr.mockRestore();
    exit.mockRestore();
  });

  it('malformed @file.json surfaces ValidationError with Hint', async () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await runCli(['scan', 'transaction', '0xSigner', '@/nope/nope/nope.json']);

    const output = stderr.mock.calls.map((c) => c[0] as string).join('');
    expect(output).toContain('ValidationError');
    expect(output).toContain('Hint: ');
    expect(exit).toHaveBeenCalledWith(1);

    stderr.mockRestore();
    exit.mockRestore();
  });
});
