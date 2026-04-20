import { Chain, ValidationError } from '@webacy-xyz/sdk-core';

export function parseNumber(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`Expected an integer, got "${value}".`);
  }
  return parsed;
}

export function parseNonNegativeNumber(value: string): number {
  const parsed = parseNumber(value);
  if (parsed < 0) {
    throw new ValidationError(`Expected a non-negative integer, got "${value}".`);
  }
  return parsed;
}

export function parseFloatOption(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`Expected a number, got "${value}".`);
  }
  return parsed;
}

export function narrowChain<T extends Chain>(
  chain: Chain | undefined,
  allowed: readonly T[],
  command: string
): T | undefined {
  if (chain === undefined) return undefined;
  if ((allowed as readonly Chain[]).includes(chain)) return chain as T;
  throw new ValidationError(
    `Chain "${chain}" is not supported for "${command}". Allowed chains: ${allowed.join(', ')}.`
  );
}

export function requireChainIn<T extends Chain>(
  chain: Chain | undefined,
  allowed: readonly T[],
  command: string
): T {
  const narrowed = narrowChain(chain, allowed, command);
  if (narrowed === undefined) {
    throw new ValidationError(
      `--chain is required for "${command}". Allowed chains: ${allowed.join(', ')}.`
    );
  }
  return narrowed;
}

export function requireChain(chain: Chain | undefined, command: string): Chain {
  if (chain === undefined) {
    throw new ValidationError(`--chain is required for "${command}".`);
  }
  return chain;
}
