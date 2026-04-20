import { Command } from 'commander';
import type { ScanTransactionRequest, ScanEIP712Request } from '@webacy-xyz/sdk-threat';
import { run } from '../../runner';
import { parseJsonInput } from '../../output';

const CHAIN_IN_BODY_NOTE =
  ' (chain ID lives in the JSON body, e.g. {"chain":1,...}; the global --chain flag is not used)';

export function registerScan(program: Command): void {
  const group = program.command('scan').description('Pre-signing scans and wallet risk scans');

  group
    .command('transaction <fromAddress> <request>')
    .description(`Scan a raw transaction before signing (JSON or @file.json).${CHAIN_IN_BODY_NOTE}`)
    .option('--refresh-cache', 'Force refresh cached analysis')
    .action(async (fromAddress: string, requestRaw: string, local, cmd) => {
      await run(cmd, ({ clients }) =>
        clients.threat.scan.scanTransaction(
          fromAddress,
          parseJsonInput(requestRaw) as ScanTransactionRequest,
          {
            ...(local.refreshCache !== undefined && {
              refreshCache: local.refreshCache as boolean,
            }),
          }
        )
      );
    });

  group
    .command('eip712 <fromAddress> <request>')
    .description(
      `Scan EIP-712 typed data before signing (JSON or @file.json).${CHAIN_IN_BODY_NOTE}`
    )
    .option('--refresh-cache', 'Force refresh cached analysis')
    .action(async (fromAddress: string, requestRaw: string, local, cmd) => {
      await run(cmd, ({ clients }) =>
        clients.threat.scan.scanEip712(
          fromAddress,
          parseJsonInput(requestRaw) as ScanEIP712Request,
          {
            ...(local.refreshCache !== undefined && {
              refreshCache: local.refreshCache as boolean,
            }),
          }
        )
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
