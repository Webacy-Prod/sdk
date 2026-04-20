import { Command } from 'commander';
import type { ScanTransactionRequest, ScanEIP712Request } from '@webacy-xyz/sdk-threat';
import { run } from '../../runner';
import { parseJsonInput } from '../../output';

export function registerScan(program: Command): void {
  const group = program.command('scan').description('Pre-signing scans and wallet risk scans');

  group
    .command('transaction <fromAddress> <request>')
    .description('Scan a raw transaction before signing (JSON or @file.json)')
    .option('--refresh-cache', 'Force refresh cached analysis')
    .action(async (fromAddress: string, requestRaw: string, local, cmd) => {
      const body = parseJsonInput(requestRaw) as ScanTransactionRequest;
      await run(cmd, ({ clients }) =>
        clients.threat.scan.scanTransaction(fromAddress, body, {
          ...(local.refreshCache !== undefined && {
            refreshCache: local.refreshCache as boolean,
          }),
        })
      );
    });

  group
    .command('eip712 <fromAddress> <request>')
    .description('Scan EIP-712 typed data before signing (JSON or @file.json)')
    .option('--refresh-cache', 'Force refresh cached analysis')
    .action(async (fromAddress: string, requestRaw: string, local, cmd) => {
      const body = parseJsonInput(requestRaw) as ScanEIP712Request;
      await run(cmd, ({ clients }) =>
        clients.threat.scan.scanEip712(fromAddress, body, {
          ...(local.refreshCache !== undefined && {
            refreshCache: local.refreshCache as boolean,
          }),
        })
      );
    });

  group
    .command('start-risk-scan <address>')
    .description('Initiate an asynchronous wallet risk scan')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.scan.startRiskScan(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('risk-scan-status <address>')
    .description('Get the status of a wallet risk scan')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.scan.getRiskScanStatus(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });
}
