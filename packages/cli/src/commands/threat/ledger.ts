import { Command } from 'commander';
import type { LedgerFamily, LedgerScanRequest, LedgerEIP712Request } from '@webacy-xyz/sdk-threat';
import { run } from '../../runner';
import { parseJsonInput } from '../../output';

const FAMILIES = ['ethereum', 'solana', 'bitcoin'] as const satisfies readonly LedgerFamily[];

export function registerLedger(program: Command): void {
  const group = program
    .command('ledger')
    .description('Hardware wallet (Ledger) transaction and EIP-712 scanning');

  group
    .command('scan-transaction <family> <request>')
    .description(
      `Scan a transaction before signing (family: ${FAMILIES.join('|')}). Request is JSON or @file.json.`
    )
    .action(async (family: string, requestRaw: string, _local, cmd) => {
      assertFamily(family);
      const body = parseJsonInput(requestRaw) as LedgerScanRequest;
      await run(cmd, ({ clients }) => clients.threat.ledger.scanTransaction(family, body));
    });

  group
    .command('scan-eip712 <family> <request>')
    .description(
      `Scan EIP-712 typed data before signing (family: ${FAMILIES.join('|')}). Request is JSON or @file.json.`
    )
    .action(async (family: string, requestRaw: string, _local, cmd) => {
      assertFamily(family);
      const body = parseJsonInput(requestRaw) as LedgerEIP712Request;
      await run(cmd, ({ clients }) => clients.threat.ledger.scanEip712(family, body));
    });
}

function assertFamily(family: string): asserts family is LedgerFamily {
  if (!(FAMILIES as readonly string[]).includes(family)) {
    throw new Error(`Invalid family "${family}". Expected one of: ${FAMILIES.join(', ')}`);
  }
}
