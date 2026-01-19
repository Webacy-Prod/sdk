/**
 * Validate that a string is a valid URL
 *
 * @param url - String to validate
 * @returns True if the string is a valid URL
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('http://example.com/path?query=1'); // true
 * isValidUrl('not-a-url'); // false
 * isValidUrl(''); // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
