import { Command } from 'commander';
import { run } from '../../runner';
import { parseListInput } from '../../output';

export function registerAddresses(program: Command): void {
  const group = program
    .command('addresses')
    .description('Address risk, sanctions, poisoning, profiles, and summaries');

  group
    .command('analyze <address>')
    .description('Analyze an address for security risks')
    .option('--modules <list>', 'Comma-separated risk modules to include')
    .option('--detailed', 'Include detailed analysis data')
    .option('--deployer-risk', 'Include deployer risk (contracts only)')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.addresses.analyze(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.modules && { modules: parseListInput(local.modules) as never }),
          ...(local.detailed !== undefined && { detailed: local.detailed as boolean }),
          ...(local.deployerRisk !== undefined && {
            deployerRisk: local.deployerRisk as boolean,
          }),
        })
      );
    });

  group
    .command('check-sanctioned <address>')
    .description('Check if an address is sanctioned')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.addresses.checkSanctioned(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('check-poisoning <address>')
    .description('Check for address poisoning attacks')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.addresses.checkPoisoning(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('quick-profile <address>')
    .description('Get a quick risk profile for an address')
    .option('--with-approvals', 'Include token approvals')
    .option('--with-new-approvals', 'Include only new approvals')
    .option('--refresh-cache', 'Force refresh cached data')
    .option('--hide-trust-flags', 'Hide trust flags in the response')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.addresses.getQuickProfile(address, {
          ...(opts.chain && { chain: opts.chain as never }),
          ...(local.withApprovals !== undefined && {
            withApprovals: local.withApprovals as boolean,
          }),
          ...(local.withNewApprovals !== undefined && {
            withNewApprovals: local.withNewApprovals as boolean,
          }),
          ...(local.refreshCache !== undefined && {
            refreshCache: local.refreshCache as boolean,
          }),
          ...(local.hideTrustFlags !== undefined && {
            hideTrustFlags: local.hideTrustFlags as boolean,
          }),
        })
      );
    });

  group
    .command('summary <address>')
    .description('Get transaction risk summary for an address')
    .option('--page <number>', 'Pagination page number', (v) => Number.parseInt(v, 10))
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.addresses.getSummary(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.page !== undefined && { page: local.page as number }),
        })
      );
    });
}
