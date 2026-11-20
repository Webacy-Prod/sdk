// Replays the 429 bodies captured from rsapi (WEB-6507) through a real HttpClient over HTTP.
// Usage: node replay-429.js <path to @webacy-xyz/sdk-core dist/cjs/index.js> <captures dir> <out json>
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const [, , corePath, capturesDir, outFile] = process.argv;
const { HttpClient } = require(corePath);

function capturedHeaders(name) {
  const keep = ['x-request-id', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset'];
  const headers = {};
  for (const line of fs.readFileSync(path.join(capturesDir, `${name}.headers.txt`), 'utf8').split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0 && keep.includes(line.slice(0, i).toLowerCase())) headers[line.slice(0, i)] = line.slice(i + 1).trim();
  }
  return headers;
}

const cases = [
  { name: 'cu-limit', body: () => fs.readFileSync(path.join(capturesDir, 'cu-limit.body.json'), 'utf8'), headers: capturedHeaders('cu-limit') },
  { name: 'quota', body: () => fs.readFileSync(path.join(capturesDir, 'quota.body.json'), 'utf8'), headers: capturedHeaders('quota') },
  { name: 'perapi-quota', body: () => fs.readFileSync(path.join(capturesDir, 'perapi-quota.body.json'), 'utf8'), headers: capturedHeaders('perapi-quota') },
  { name: 'rate', body: () => fs.readFileSync(path.join(capturesDir, 'rate.body.json'), 'utf8'), headers: capturedHeaders('rate') },
  {
    // Same captured rate body with timestamp set to now and resetAt 2 s later, to show the wait tracks resetAt.
    name: 'rate-resetAt-plus-2s',
    body: () => {
      const b = JSON.parse(fs.readFileSync(path.join(capturesDir, 'rate.body.json'), 'utf8'));
      b.timestamp = new Date().toISOString();
      b.details.resetAt = new Date(Date.now() + 2000).toISOString();
      return JSON.stringify(b);
    },
    headers: capturedHeaders('rate'),
  },
  // API Gateway THROTTLED template `{"message":$context.error.messageString}` (gateway-429-templates.txt).
  { name: 'gateway-per-key', body: () => JSON.stringify({ message: 'Too Many Requests' }), headers: {} },
];

async function run(c) {
  const hits = [];
  const server = http.createServer((req, res) => {
    hits.push(Date.now());
    if (hits.length === 1 || c.name === 'gateway-per-key' || !c.name.startsWith('rate')) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8', ...c.headers });
      res.end(c.body());
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const client = new HttpClient({ baseUrl: `http://127.0.0.1:${server.address().port}`, retry: { maxRetries: 3, initialDelay: 200 } });
  const start = Date.now();
  let outcome;
  try {
    const res = await client.get('/api/v2/vaults');
    outcome = { result: 'success', status: res.status };
  } catch (e) {
    outcome = {
      result: 'threw',
      name: e.name,
      isRetryable: e.isRetryable(),
      limitType: e.limitType,
      limit: e.limit,
      currentUsage: e.currentUsage,
      resetAt: e.resetAt,
      resetAtIso: e.resetAt ? new Date(e.resetAt * 1000).toISOString() : undefined,
      retryAfter: e.retryAfter,
      upgradeUrl: e.upgradeUrl,
      requestId: e.requestId,
      recoverySuggestion: e.getRecoverySuggestion(),
    };
  }
  server.close();
  return {
    case: c.name,
    requests: hits.length,
    msBetweenRequests: hits.slice(1).map((t, i) => t - hits[i]),
    elapsedMs: Date.now() - start,
    ...outcome,
  };
}

(async () => {
  const results = [];
  for (const c of cases) results.push(await run(c));
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
})();
