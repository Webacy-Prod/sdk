import { Command } from 'commander';
import type { SolidityAnalysisRequest } from '@webacy-xyz/sdk-threat';
import { run } from '../../runner';
import { parseJsonInput } from '../../output';

export function registerContracts(program: Command): void {
  const group = program
    .command('contracts')
    .description('Smart contract risk, source, taxes, audits, and symbol lookup');

  group
    .command('analyze <address>')
    .description('Analyze a contract for security risks')
    .option('--deployer-risk', 'Include deployer risk')
    .option('--from-bytecode', 'Analyze from bytecode when unverified')
    .option('--refresh-cache', 'Force refresh cached data')
    .option('--disable-checksum', 'Disable address checksum validation')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.contracts.analyze(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.deployerRisk !== undefined && {
            deployerRisk: local.deployerRisk as boolean,
          }),
          ...(local.fromBytecode !== undefined && {
            fromBytecode: local.fromBytecode as boolean,
          }),
          ...(local.refreshCache !== undefined && {
            refreshCache: local.refreshCache as boolean,
          }),
          ...(local.disableChecksum !== undefined && {
            disableChecksum: local.disableChecksum as boolean,
          }),
        })
      );
    });

  group
    .command('source-code <address>')
    .description('Get verified contract source code')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.contracts.getSourceCode(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('taxes <address>')
    .description('Get token buy/sell taxes')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.contracts.getTaxes(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('analyze-solidity <request>')
    .description('Analyze raw Solidity source (JSON body or @file.json)')
    .action(async (requestRaw: string, _local, cmd) => {
      const body = parseJsonInput(requestRaw) as SolidityAnalysisRequest;
      await run(cmd, ({ clients }) => clients.threat.contracts.analyzeSolidity(body));
    });

  group
    .command('code-analysis <address>')
    .description('Static code analysis for a verified contract')
    .option('--refresh-cache', 'Force refresh cached analysis')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.contracts.getCodeAnalysis(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.refreshCache !== undefined && {
            refreshCache: local.refreshCache as boolean,
          }),
        })
      );
    });

  group
    .command('audits <address>')
    .description('Get audit data for a contract')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.contracts.getAudits(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('by-symbol <symbol>')
    .description('Look up contracts by token symbol')
    .action(async (symbol: string, _local, cmd) => {
      await run(cmd, ({ clients }) => clients.threat.contracts.getBySymbol(symbol));
    });
}
