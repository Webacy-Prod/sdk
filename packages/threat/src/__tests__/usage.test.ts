import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageResource } from '../resources/usage';
import { ValidationError, HttpClient } from '@webacy-xyz/sdk-core';

// Mock HttpClient
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

describe('UsageResource', () => {
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;
  let usage: UsageResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    usage = new UsageResource(mockHttpClient as unknown as HttpClient);
  });

  describe('getMaxRps', () => {
    it('should throw ValidationError for missing organization', async () => {
      await expect(usage.getMaxRps({ organization: '', from: 1000, to: 2000 })).rejects.toThrow(
        ValidationError
      );
      await expect(usage.getMaxRps({ organization: '', from: 1000, to: 2000 })).rejects.toThrow(
        'Organization name is required'
      );
    });

    it('should throw ValidationError for invalid from timestamp', async () => {
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: -1, to: 2000 })
      ).rejects.toThrow(ValidationError);
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: -1, to: 2000 })
      ).rejects.toThrow('From timestamp must be a non-negative number');
    });

    it('should throw ValidationError for invalid to timestamp', async () => {
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: 1000, to: -1 })
      ).rejects.toThrow(ValidationError);
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: 1000, to: -1 })
      ).rejects.toThrow('To timestamp must be a non-negative number');
    });

    it('should throw ValidationError when from >= to', async () => {
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: 2000, to: 1000 })
      ).rejects.toThrow(ValidationError);
      await expect(
        usage.getMaxRps({ organization: 'test-org', from: 2000, to: 1000 })
      ).rejects.toThrow('From timestamp must be less than to timestamp');

      await expect(
        usage.getMaxRps({ organization: 'test-org', from: 1000, to: 1000 })
      ).rejects.toThrow(ValidationError);
    });

    it('should make API call with valid parameters', async () => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      mockHttpClient.get.mockResolvedValueOnce({
        data: 150,
        status: 200,
        headers: new Headers(),
      });

      const result = await usage.getMaxRps({
        organization: 'test-org',
        from: oneDayAgo,
        to: now,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/usage/max-rps?'),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('organization=test-org'),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`from=${oneDayAgo}`),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`to=${now}`),
        expect.any(Object)
      );
      expect(result).toBe(150);
    });

    it('should return null when no data', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: null,
        status: 200,
        headers: new Headers(),
      });

      const result = await usage.getMaxRps({
        organization: 'test-org',
        from: 1000,
        to: 2000,
      });

      expect(result).toBeNull();
    });

    it('should pass timeout to httpClient', async () => {
      mockHttpClient.get.mockResolvedValueOnce({
        data: 100,
        status: 200,
        headers: new Headers(),
      });

      await usage.getMaxRps({
        organization: 'test-org',
        from: 1000,
        to: 2000,
        timeout: 30000,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000 })
      );
    });
  });
});
