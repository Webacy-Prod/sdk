/**
 * Validate that a string is a valid URL
 *
 * @param url - String to validate
 * @returns True if the string is a valid URL with a hostname
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('http://example.com/path?query=1'); // true
 * isValidUrl('not-a-url'); // false
 * isValidUrl(''); // false
 * isValidUrl('http://'); // false (no hostname)
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Require a valid hostname (not empty)
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
