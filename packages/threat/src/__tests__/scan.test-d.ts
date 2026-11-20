import { describe, it, expectTypeOf } from 'vitest';
import type { ScanResource } from '../resources/scan';
import type {
  ScanResponse,
  ScanSolanaResponse,
  ScanSolanaTransactionRequest,
  ScanTransactionRequest,
} from '../types';

// Type-level tests, checked by `pnpm typecheck` (tsconfig.test.json), not run by
// vitest: pin what each scanTransaction overload returns.
type Scan = ScanResource['scanTransaction'];
declare const scan: Scan;
declare const sol: ScanSolanaTransactionRequest;
declare const evm: ScanTransactionRequest;
declare const either: ScanTransactionRequest | ScanSolanaTransactionRequest;

describe('scanTransaction overloads', () => {
  it('returns ScanSolanaResponse for chain sol', () => {
    expectTypeOf(() => scan('a', sol)).returns.resolves.toEqualTypeOf<ScanSolanaResponse>();
  });

  it('keeps the EVM return type (descriptor: string)', () => {
    expectTypeOf(() => scan('a', evm)).returns.resolves.toEqualTypeOf<ScanResponse>();
    expectTypeOf<ScanResponse['descriptor']>().toEqualTypeOf<string>();
  });

  it('returns the union for a request typed as either chain', () => {
    expectTypeOf(() => scan('a', either)).returns.resolves.toEqualTypeOf<
      ScanResponse | ScanSolanaResponse
    >();
  });
});
