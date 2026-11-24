import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../http/client';
import { RateLimitError } from '../errors';

// The three plan-limit 429 examples of `components.responses.TooManyRequests` in the
// API spec (risk-score-api-v2 docs/webacy-risk-score-oas3-v1.0.1-external.json), verbatim.
const CU_LIMIT = {
  statusCode: 429,
  timestamp: '2026-11-19T18:43:20.520Z',
  path: '/api/v2/vaults',
  message:
    'Monthly compute unit limit exceeded: your 1000 CU for this period are used up. Upgrade your plan at https://developers.webacy.com/billing to keep using the API, or wait for the reset.',
  details: {
    currentUsage: '1004',
    limit: '1000',
    resetAt: '2026-11-30T23:59:59.999Z',
    upgradeUrl: 'https://developers.webacy.com/billing',
  },
};
const REQUEST_QUOTA = {
  statusCode: 429,
  timestamp: '2026-11-19T18:43:24.192Z',
  path: '/api/v2/vaults',
  message:
    'Monthly request quota exceeded: your 3 requests for this period are used up across all API keys of your organization. Upgrade your plan at https://developers.webacy.com/billing to keep using the API, or wait for the reset.',
  details: {
    limitType: 'quota',
    currentUsage: '3',
    limit: '3',
    resetAt: '2026-12-01T00:00:00.000Z',
    upgradeUrl: 'https://developers.webacy.com/billing',
  },
};
const REQUEST_RATE = {
  statusCode: 429,
  timestamp: '2026-11-19T18:43:24.237Z',
  path: '/api/v2/vaults',
  message:
    'Rate limit exceeded: your plan allows 1 request per second across all API keys of your organization. Slow down or upgrade your plan at https://developers.webacy.com/billing.',
  details: {
    limitType: 'rate',
    limit: '1',
    resetAt: '2026-11-19T18:43:25.212Z',
    upgradeUrl: 'https://developers.webacy.com/billing',
  },
};
// The per-key gateway 429 is `{"message":$context.error.messageString}` (API Gateway's
// THROTTLED response); a temporary service 429 is the API's error body without `details`.
const GATEWAY = { message: 'Too Many Requests' };
const SERVICE = {
  statusCode: 429,
  timestamp: '2026-11-19T18:43:24.237Z',
  path: '/api/v2/vaults',
  message: 'Too many requests',
};

function response(status: number, body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    headers: new Headers({ 'content-type': 'application/json', ...headers }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

const makeClient = (maxRetries = 2) =>
  new HttpClient({ baseUrl: 'https://api.test', retry: { maxRetries, initialDelay: 1 } });

describe('429 handling', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // The rate example's own timestamp: its resetAt is 975 ms later.
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-11-19T18:43:24.237Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  const mockFetch = (...bodies: Array<[number, unknown]>) => {
    const fn = vi.fn();
    for (const [status, body] of bodies) fn.mockResolvedValueOnce(response(status, body));
    global.fetch = fn as unknown as typeof fetch;
    return fn;
  };

  it('throws a compute unit 429 at once with its details', async () => {
    const fetchMock = mockFetch([429, CU_LIMIT], [200, { ok: true }]);
    const err = await makeClient()
      .get('/vaults')
      .catch((e) => e);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.message).toBe(CU_LIMIT.message);
    expect(err.limitType).toBeUndefined();
    expect(err.limit).toBe('1000');
    expect(err.currentUsage).toBe('1004');
    expect(err.resetAt).toBe(Math.ceil(Date.parse('2026-11-30T23:59:59.999Z') / 1000));
    expect(err.upgradeUrl).toBe('https://developers.webacy.com/billing');
    expect(err.retryAfter).toBeUndefined();
    expect(err.isRetryable()).toBe(false);
    expect(err.getRecoverySuggestion()).toBe(
      "Your organization's monthly compute unit allowance is used up until 2026-12-01T00:00:00.000Z. Upgrade your plan at https://developers.webacy.com/billing or wait for the reset."
    );
  });

  it('throws a request quota 429 at once with its details', async () => {
    const fetchMock = mockFetch([429, REQUEST_QUOTA], [200, { ok: true }]);
    const err = await makeClient()
      .get('/vaults')
      .catch((e) => e);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(err.limitType).toBe('quota');
    expect(err.limit).toBe('3');
    expect(err.currentUsage).toBe('3');
    expect(err.resetAt).toBe(Date.parse('2026-12-01T00:00:00.000Z') / 1000);
    expect(err.upgradeUrl).toBe('https://developers.webacy.com/billing');
    expect(err.isRetryable()).toBe(false);
    expect(err.getRecoverySuggestion()).toContain('monthly request quota is used up');
  });

  it('retries a rate 429 once resetAt has passed', async () => {
    const fetchMock = mockFetch([429, REQUEST_RATE], [200, { ok: true }]);
    const pending = makeClient().get<{ ok: boolean }>('/vaults');

    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1); // still waiting for resetAt (975 ms, rounded up to 1 s)
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await pending).data.ok).toBe(true);
  });

  it('waits for a rate reset beyond maxDelay instead of retrying early', async () => {
    const later = {
      ...REQUEST_RATE,
      details: { ...REQUEST_RATE.details, resetAt: '2026-11-19T18:44:24.237Z' },
    };
    const fetchMock = mockFetch([429, later], [200, { ok: true }]);
    const pending = makeClient().get<{ ok: boolean }>('/vaults');

    // 60 s, double the default 30 s maxDelay.
    await vi.advanceTimersByTimeAsync(59_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await pending).data.ok).toBe(true);
  });

  it('exposes the rate details when the retries run out', async () => {
    mockFetch([429, REQUEST_RATE]);
    const err = await makeClient(0)
      .get('/vaults')
      .catch((e) => e);

    expect(err.limitType).toBe('rate');
    expect(err.limit).toBe('1');
    expect(err.currentUsage).toBeUndefined();
    expect(err.resetAt).toBe(Math.ceil(Date.parse('2026-11-19T18:43:25.212Z') / 1000));
    expect(err.retryAfter).toBe(1);
    expect(err.isRetryable()).toBe(true);
  });

  it.each([
    ['the per-key gateway 429 (message only)', GATEWAY],
    ['a temporary service 429 (no details)', SERVICE],
  ])('retries %s with bounded backoff', async (_name, body) => {
    const fetchMock = mockFetch([429, body], [429, body], [429, body], [200, { ok: true }]);
    const pending = makeClient(2)
      .get('/vaults')
      .catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await pending;

    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 + maxRetries, never the 4th
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.message).toBe(body.message);
    expect(err.limitType).toBeUndefined();
    expect(err.upgradeUrl).toBeUndefined();
    expect(err.isRetryable()).toBe(true);
  });

  it('prefers a Retry-After header over the rate resetAt', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        response(429, REQUEST_RATE, { 'retry-after': '5' })
      ) as unknown as typeof fetch;
    const err = await makeClient(0)
      .get('/vaults')
      .catch((e) => e);
    expect(err.retryAfter).toBe(5);
  });

  it('treats unknown details as a plan limit and does not retry', async () => {
    const fetchMock = mockFetch([429, { message: 'x', details: { limitType: 'daily', limit: 5 } }]);
    const err = await makeClient()
      .get('/vaults')
      .catch((e) => e);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(err.limitType).toBeUndefined();
    expect(err.limit).toBeUndefined(); // not a string
    expect(err.isRetryable()).toBe(false);
    expect(err.getRecoverySuggestion()).toContain('plan limit');
    expect(err.getRecoverySuggestion()).not.toContain('compute unit');
  });

  it.each([
    ['an empty details object', {}],
    ['details with no known field', { reason: 'concurrency' }],
  ])('retries a 429 with %s like one without details', async (_name, details) => {
    const fetchMock = mockFetch(
      [429, { ...SERVICE, details }],
      [429, { ...SERVICE, details }],
      [200, { ok: true }]
    );
    const pending = makeClient(2).get('/vaults');
    await vi.runAllTimersAsync();
    await pending;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('measures the rate wait from the body timestamp, not the client clock', async () => {
    vi.setSystemTime(new Date('2026-11-19T18:33:24.237Z')); // client 10 minutes behind
    mockFetch([429, REQUEST_RATE]);
    const err = await makeClient(0)
      .get('/vaults')
      .catch((e) => e);
    expect(err.retryAfter).toBe(1);
  });

  it('caps the rate wait at 300 s like Retry-After', async () => {
    const far = {
      ...REQUEST_RATE,
      details: { ...REQUEST_RATE.details, resetAt: '2026-11-19T20:00:00.000Z' },
    };
    mockFetch([429, far]);
    const err = await makeClient(0)
      .get('/vaults')
      .catch((e) => e);
    expect(err.retryAfter).toBe(300);
  });

  it('serializes the details and retryAfter in toJSON', async () => {
    mockFetch([429, REQUEST_RATE]);
    const err = await makeClient(0)
      .get('/vaults')
      .catch((e) => e);
    expect(err.toJSON()).toMatchObject({
      status: 429,
      retryAfter: 1,
      limitType: 'rate',
      limit: '1',
      upgradeUrl: 'https://developers.webacy.com/billing',
    });
  });
});
