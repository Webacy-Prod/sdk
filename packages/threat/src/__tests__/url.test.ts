import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UrlResource } from '../resources/url';
import { ValidationError, HttpClient } from '@webacy-xyz/sdk-core';

const createMockHttpClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  addRequestInterceptor: vi.fn(),
  addResponseInterceptor: vi.fn(),
  addErrorInterceptor: vi.fn(),
});

describe('UrlResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let url: UrlResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    url = new UrlResource(mockHttpClient as unknown as HttpClient);
  });

  describe('check', () => {
    it('should accept bare domains and normalize them', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { prediction: 'benign', blacklist: 'false', whitelist: 'false' },
        status: 200,
        headers: new Headers(),
      });

      await url.check('aid.gaib.ai');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/url',
        { url: 'https://aid.gaib.ai' },
        expect.any(Object)
      );
    });

    it('should accept full URLs unchanged', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { prediction: 'benign', blacklist: 'false', whitelist: 'false' },
        status: 200,
        headers: new Headers(),
      });

      await url.check('https://example.com');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/url',
        { url: 'https://example.com' },
        expect.any(Object)
      );
    });

    it('should throw ValidationError for empty string', async () => {
      await expect(url.check('')).rejects.toThrow(ValidationError);
    });
  });

  describe('add', () => {
    it('should accept bare domains and normalize them', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: new Headers(),
      });

      await url.add('phishing-site.com');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/url/add',
        { url: 'https://phishing-site.com' },
        expect.any(Object)
      );
    });

    it('should accept full URLs unchanged', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: new Headers(),
      });

      await url.add('https://phishing-site.com');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/url/add',
        { url: 'https://phishing-site.com' },
        expect.any(Object)
      );
    });

    it('should throw ValidationError for empty string', async () => {
      await expect(url.add('')).rejects.toThrow(ValidationError);
    });
  });
});
