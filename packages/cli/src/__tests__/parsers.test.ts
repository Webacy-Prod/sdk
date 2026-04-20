import { describe, expect, it } from 'vitest';
import { Chain, ValidationError } from '@webacy-xyz/sdk-core';
import {
  narrowChain,
  parseEnumList,
  parseFloatOption,
  parseNonNegativeNumber,
  parseNumber,
  requireChain,
  requireChainIn,
} from '../parsers';

describe('parseNumber', () => {
  it('parses an integer', () => {
    expect(parseNumber('42')).toBe(42);
  });

  it('parses a negative integer', () => {
    expect(parseNumber('-5')).toBe(-5);
  });

  it('throws ValidationError for non-numeric input', () => {
    expect(() => parseNumber('abc')).toThrow(ValidationError);
  });

  it('throws ValidationError for floats (no silent truncation)', () => {
    expect(() => parseNumber('3.9')).toThrow(ValidationError);
  });

  it('throws ValidationError for trailing garbage (no silent accept)', () => {
    expect(() => parseNumber('10abc')).toThrow(ValidationError);
  });

  it('throws ValidationError for empty string', () => {
    expect(() => parseNumber('')).toThrow(ValidationError);
  });
});

describe('parseNonNegativeNumber', () => {
  it('parses a non-negative integer', () => {
    expect(parseNonNegativeNumber('0')).toBe(0);
    expect(parseNonNegativeNumber('100')).toBe(100);
  });

  it('rejects negatives', () => {
    expect(() => parseNonNegativeNumber('-1')).toThrow(ValidationError);
  });

  it('rejects non-numeric input', () => {
    expect(() => parseNonNegativeNumber('nope')).toThrow(ValidationError);
  });

  it('rejects floats', () => {
    expect(() => parseNonNegativeNumber('2.5')).toThrow(ValidationError);
  });
});

describe('parseFloatOption', () => {
  it('parses a float', () => {
    expect(parseFloatOption('3.14')).toBeCloseTo(3.14);
  });

  it('parses an integer as float', () => {
    expect(parseFloatOption('42')).toBe(42);
  });

  it('parses a negative float', () => {
    expect(parseFloatOption('-0.5')).toBe(-0.5);
  });

  it('throws ValidationError for non-numeric input', () => {
    expect(() => parseFloatOption('notanumber')).toThrow(ValidationError);
  });

  it('throws ValidationError for trailing garbage', () => {
    expect(() => parseFloatOption('3.14abc')).toThrow(ValidationError);
  });
});

describe('parseEnumList', () => {
  const allowed = ['a', 'b', 'c'] as const;

  it('parses a comma-separated list of allowed values', () => {
    expect(parseEnumList('a,b', allowed, '--test')).toEqual(['a', 'b']);
  });

  it('trims whitespace', () => {
    expect(parseEnumList('a , b ,c', allowed, '--test')).toEqual(['a', 'b', 'c']);
  });

  it('drops empty entries', () => {
    expect(parseEnumList('a,,b,', allowed, '--test')).toEqual(['a', 'b']);
  });

  it('rejects values not in the allowed set', () => {
    expect(() => parseEnumList('a,zzz', allowed, '--test')).toThrow(ValidationError);
  });

  it('error message names the flag, bad values, and allowed set', () => {
    try {
      parseEnumList('a,bad', allowed, '--test');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      const msg = (err as Error).message;
      expect(msg).toContain('--test');
      expect(msg).toContain('bad');
      expect(msg).toContain('a, b, c');
    }
  });
});

describe('narrowChain', () => {
  const allowed = [Chain.ETH, Chain.BASE] as const;

  it('returns undefined when chain is undefined', () => {
    expect(narrowChain(undefined, allowed, 'test')).toBeUndefined();
  });

  it('returns the chain when it is allowed', () => {
    expect(narrowChain(Chain.ETH, allowed, 'test')).toBe(Chain.ETH);
  });

  it('throws ValidationError when chain is not in the allowed set', () => {
    expect(() => narrowChain(Chain.SOL, allowed, 'test')).toThrow(ValidationError);
  });

  it('error message lists allowed chains and the command name', () => {
    try {
      narrowChain(Chain.SOL, allowed, 'my-command');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).toContain('my-command');
      expect((err as Error).message).toContain('eth');
      expect((err as Error).message).toContain('base');
    }
  });
});

describe('requireChainIn', () => {
  const allowed = [Chain.SOL] as const;

  it('returns the chain when valid', () => {
    expect(requireChainIn(Chain.SOL, allowed, 'test')).toBe(Chain.SOL);
  });

  it('throws ValidationError when undefined', () => {
    expect(() => requireChainIn(undefined, allowed, 'test')).toThrow(ValidationError);
  });

  it('throws ValidationError when disallowed', () => {
    expect(() => requireChainIn(Chain.ETH, allowed, 'test')).toThrow(ValidationError);
  });
});

describe('requireChain', () => {
  it('returns the chain when defined', () => {
    expect(requireChain(Chain.ETH, 'test')).toBe(Chain.ETH);
  });

  it('throws ValidationError when undefined', () => {
    expect(() => requireChain(undefined, 'test')).toThrow(ValidationError);
  });
});
