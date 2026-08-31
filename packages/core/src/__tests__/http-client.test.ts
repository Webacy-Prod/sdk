import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../http/client';
import { ValidationError, RateLimitError, NetworkError, WebacyError } from '../errors';

/**
 * Build a minimal Response-like object for mocking `fetch`.
 */
function mockResponse(opts: {
  status?: number;
  contentType?: string | null;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  headers?: Record<string, string>;
}) {
  const status = opts.status ?? 200;
  const headers = new Headers(opts.headers ?? {});
  if (opts.contentType) headers.set('content-type', opts.contentType);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    headers,
    json: opts.json ?? (async () => ({})),
    text: opts.text ?? (async () => ''),
  };
}

/** A fetch mock that rejects with an AbortError when its signal aborts. */
function abortAwareFetch() {
  return vi.fn(
    (_url: string, init?: { signal?: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        const fail = () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        };
        if (init?.signal?.aborted) return fail();
        init?.signal?.addEventListener('abort', fail);
      })
  );
}

describe('HttpClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const makeClient = (retry?: { maxRetries?: number; initialDelay?: number }, timeout?: number) =>
    new HttpClient({
      baseUrl: 'https://api.test',
      timeout,
      retry: { maxRetries: 2, initialDelay: 1, ...retry },
    });

  it('parses a JSON success response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        mockResponse({ contentType: 'application/json', json: async () => ({ overallRisk: 25 }) })
      ) as unknown as typeof fetch;

    const res = await makeClient().get<{ overallRisk: number }>('/addresses/x');
    expect(res.status).toBe(200);
    expect(res.data.overallRisk).toBe(25);
  });

  it('returns raw text for a non-JSON response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        mockResponse({ contentType: 'text/plain', text: async () => 'pong' })
      ) as unknown as typeof fetch;

    const res = await makeClient().get<string>('/ping');
    expect(res.data).toBe('pong');
  });

  it('retries on a 503 and then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({ status: 503, json: async () => ({ message: 'down' }) }))
      .mockResolvedValueOnce(mockResponse({ status: 503, json: async () => ({ message: 'down' }) }))
      .mockResolvedValueOnce(
        mockResponse({ contentType: 'application/json', json: async () => ({ ok: true }) })
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await makeClient().get<{ ok: boolean }>('/flaky');
    expect(res.data.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a 400 and throws ValidationError', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        mockResponse({ status: 400, json: async () => ({ message: 'bad input' }) })
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(makeClient().get('/bad')).rejects.toThrow(ValidationError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps 429 to RateLimitError and does NOT cap resetAt (a Unix timestamp)', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse({
        status: 429,
        json: async () => ({ message: 'rate limited' }),
        headers: { 'retry-after': '600', 'x-ratelimit-reset': '1799999999' },
      })
    ) as unknown as typeof fetch;

    // maxRetries: 0 so it surfaces immediately instead of waiting on retry-after.
    const err = await makeClient({ maxRetries: 0 })
      .get('/limited')
      .catch((e) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    // retryAfter is a delay -> capped at 300; resetAt is a timestamp -> NOT capped.
    expect(err.retryAfter).toBe(300);
    expect(err.resetAt).toBe(1799999999);
  });

  it('treats a malformed JSON body on a 2xx as a non-retryable parse error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        contentType: 'application/json',
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const err = await makeClient()
      .get('/broken')
      .catch((e) => e);
    expect(err).toBeInstanceOf(WebacyError);
    expect(err).not.toBeInstanceOf(NetworkError); // not the retryable path
    expect(err.code).toBe('PARSE_ERROR');
    expect(fetchMock).toHaveBeenCalledTimes(1); // not retried
  });

  it('reports a timeout distinctly from a caller cancellation', async () => {
    global.fetch = abortAwareFetch() as unknown as typeof fetch;
    await expect(makeClient({ maxRetries: 0 }, 20).get('/slow')).rejects.toThrow(
      'Request timed out'
    );
  });

  it('reports a caller-cancelled request', async () => {
    global.fetch = abortAwareFetch() as unknown as typeof fetch;
    const controller = new AbortController();
    controller.abort();
    await expect(
      makeClient({ maxRetries: 0 }).get('/cancelled', { signal: controller.signal })
    ).rejects.toThrow('cancelled by the caller');
  });
});
