import { ValidationError } from '@webacy-xyz/sdk-core';

/**
 * Parse a comma-separated list of enum values, validating each entry
 * against an allowed set. Throws `ValidationError` on any unknown value.
 */
export function parseEnumList<T extends string>(
  value: string,
  allowed: readonly T[],
  flag: string
): T[] {
  const items = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const invalid = items.filter((s) => !(allowed as readonly string[]).includes(s));
  if (invalid.length > 0) {
    throw new ValidationError(
      `Invalid ${flag} value(s): ${invalid.join(', ')}. Allowed: ${allowed.join(', ')}.`
    );
  }
  return items as T[];
}
