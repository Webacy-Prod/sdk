/**
 * Normalize a URL by prepending `https://` if no protocol is present.
 *
 * Bare domains like `aid.gaib.ai` are valid inputs from users but fail
 * `new URL()` parsing without a protocol. This mirrors the backend behavior
 * of auto-prepending `https://`.
 *
 * @param url - URL or bare domain to normalize
 * @returns URL with protocol prefix
 *
 * @example
 * ```typescript
 * normalizeUrl('example.com');           // 'https://example.com'
 * normalizeUrl('example.com/path');      // 'https://example.com/path'
 * normalizeUrl('https://example.com');   // 'https://example.com' (unchanged)
 * normalizeUrl('http://example.com');    // 'http://example.com' (unchanged)
 * ```
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

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
