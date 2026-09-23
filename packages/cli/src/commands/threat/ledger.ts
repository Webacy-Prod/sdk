import { Command } from 'commander';
import type { LedgerFamily, LedgerScanRequest, LedgerEIP712Request } from '@webacy-xyz/sdk-threat';
import { ValidationError } from '@webacy-xyz/sdk-core';
import { run } from '../../runner';
import { parseJsonInput } from '../../output';

const FAMILIES = ['ethereum', 'solana', 'bitcoin'] as const satisfies readonly LedgerFamily[];
const CHAIN_IN_BODY_NOTE =
  ' (numeric chain ID lives in the JSON body; the global --chain flag is not used)';

export function registerLedger(program: Command): void {
  const group = program
    .command('ledger')
    .description('Hardware wallet (Ledger) transaction and EIP-712 scanning');

  group
    .command('scan-transaction <family> <request>')
    .description(
      `Scan a transaction before signing (family: ${FAMILIES.join('|')}). Request is JSON or @file.json.${CHAIN_IN_BODY_NOTE}`
    )
    .action(async (family: string, requestRaw: string, _local, cmd) => {
      await run(cmd, ({ clients }) => {
        assertFamily(family);
        const body = parseJsonInput(requestRaw) as LedgerScanRequest;
        return clients.threat.ledger.scanTransaction(family, body);
      });
    });

  group
    .command('scan-eip712 <family> <request>')
    .description(
      `Scan EIP-712 typed data before signing (family: ${FAMILIES.join('|')}). Request is JSON or @file.json.${CHAIN_IN_BODY_NOTE}`
    )
    .action(async (family: string, requestRaw: string, _local, cmd) => {
      await run(cmd, ({ clients }) => {
        assertFamily(family);
        const body = parseJsonInput(requestRaw) as LedgerEIP712Request;
        return clients.threat.ledger.scanEip712(family, body);
      });
    });
}

function assertFamily(family: string): asserts family is LedgerFamily {
  if (!(FAMILIES as readonly string[]).includes(family)) {
    throw new ValidationError(
      `Invalid Ledger family "${family}". Expected one of: ${FAMILIES.join(', ')}.`
    );
  }
}
