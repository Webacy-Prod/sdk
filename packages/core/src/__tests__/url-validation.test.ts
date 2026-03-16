import { describe, it, expect } from 'vitest';
import { isValidUrl, normalizeUrl } from '../utils';

describe('isValidUrl', () => {
  describe('valid URLs', () => {
    it('should return true for https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
      expect(isValidUrl('https://sub.example.com')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should return true for http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should return true for URLs with special characters in path', () => {
      expect(isValidUrl('https://example.com/path/to/resource')).toBe(true);
      expect(isValidUrl('https://example.com/path?foo=bar&baz=qux')).toBe(true);
      expect(isValidUrl('https://example.com/path#anchor')).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('should return false for non-http/https protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///path/to/file')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should return false for invalid URL formats', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    it('should return false for null/undefined-like inputs', () => {
      expect(isValidUrl('')).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidUrl(null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidUrl(undefined)).toBe(false);
    });
  });
});

describe('normalizeUrl', () => {
  it('should return URL unchanged if it already has https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
  });

  it('should return URL unchanged if it already has http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('should prepend https:// for bare domains', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('aid.gaib.ai')).toBe('https://aid.gaib.ai');
    expect(normalizeUrl('sub.domain.example.com')).toBe('https://sub.domain.example.com');
  });

  it('should prepend https:// for domains with paths', () => {
    expect(normalizeUrl('example.com/path')).toBe('https://example.com/path');
    expect(normalizeUrl('example.com/path?query=1')).toBe('https://example.com/path?query=1');
  });

  it('should return input unchanged for empty/null/undefined', () => {
    expect(normalizeUrl('')).toBe('');
    // @ts-expect-error testing invalid input
    expect(normalizeUrl(null)).toBe(null);
    // @ts-expect-error testing invalid input
    expect(normalizeUrl(undefined)).toBe(undefined);
  });
});
