import { describe, it, expect } from 'vitest';
import { isValidUrl } from '../utils';

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
