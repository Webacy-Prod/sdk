/**
 * Debugging Examples
 *
 * This example demonstrates how to use debug logging
 * and interceptors for troubleshooting.
 */

import { ThreatClient, Chain, Logger } from '@webacy/sdk';

async function main() {
  // Example 1: Enable all debug logging
  console.log('\n=== Example 1: Full Debug Logging ===');
  const debugClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    debug: true, // or 'all'
  });

  try {
    await debugClient.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
      chain: Chain.ETH,
    });
  } catch {
    // Errors are logged automatically
  }

  // Example 2: Log only requests
  console.log('\n=== Example 2: Request-Only Logging ===');
  const requestLogClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    debug: 'requests',
  });

  await requestLogClient.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
    chain: Chain.ETH,
  });

  // Example 3: Log only errors
  console.log('\n=== Example 3: Error-Only Logging ===');
  const errorLogClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    debug: 'errors',
  });

  try {
    await errorLogClient.addresses.analyze('invalid-address', {
      chain: Chain.ETH,
    });
  } catch {
    // Error was logged
  }

  // Example 4: Custom logger
  console.log('\n=== Example 4: Custom Logger ===');
  const customLogger: Logger = {
    debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data ?? ''),
    info: (msg, data) => console.log(`[INFO] ${msg}`, data ?? ''),
    warn: (msg, data) => console.warn(`[WARN] ${msg}`, data ?? ''),
    error: (msg, data) => console.error(`[ERROR] ${msg}`, data ?? ''),
  };

  const customLogClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    debug: true,
    logger: customLogger,
  });

  await customLogClient.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
    chain: Chain.ETH,
  });

  // Example 5: Using interceptors for debugging
  console.log('\n=== Example 5: Interceptor Debugging ===');
  const interceptorClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Log all requests
  interceptorClient.addRequestInterceptor((url, config) => {
    console.log(`[Request] ${config.method ?? 'GET'} ${url}`);
    return config;
  });

  // Log all responses with timing
  // Use a queue since requests complete in order for sequential calls
  const pendingRequests: { url: string; startTime: number }[] = [];

  interceptorClient.addRequestInterceptor((url, config) => {
    pendingRequests.push({ url, startTime: Date.now() });
    return config;
  });

  interceptorClient.addResponseInterceptor((response) => {
    const pending = pendingRequests.shift(); // Get oldest pending request
    const duration = pending ? Date.now() - pending.startTime : 0;
    const endpoint = pending?.url ?? 'unknown';
    console.log(`[Response] ${endpoint.split('?')[0]} - Status ${response.status} in ${duration}ms`);
    console.log(`[Request ID] ${response.requestId}`);
    return response;
  });

  // Log errors with full context and clean up pending requests
  interceptorClient.addErrorInterceptor((error) => {
    // Remove the corresponding entry from pendingRequests to prevent queue drift
    const pending = pendingRequests.shift();
    const duration = pending ? Date.now() - pending.startTime : 0;

    console.error('[Error Details]', {
      code: error.code,
      message: error.message,
      endpoint: error.endpoint ?? pending?.url,
      requestId: error.requestId,
      retryable: error.isRetryable(),
      duration: `${duration}ms`,
    });
    return error;
  });

  await interceptorClient.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
    chain: Chain.ETH,
  });

  // Example 6: Performance monitoring
  console.log('\n=== Example 6: Performance Monitoring ===');
  const perfClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  const requestTimes: { endpoint: string; duration: number }[] = [];
  // Use a queue to track pending requests in order
  const perfPendingRequests: { url: string; startTime: number }[] = [];

  perfClient.addRequestInterceptor((url, config) => {
    perfPendingRequests.push({ url, startTime: Date.now() });
    return config;
  });

  perfClient.addResponseInterceptor((response) => {
    const pending = perfPendingRequests.shift(); // Get oldest pending request
    if (pending) {
      requestTimes.push({
        endpoint: pending.url,
        duration: Date.now() - pending.startTime,
      });
    }
    return response;
  });

  // Make some requests
  await perfClient.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
    chain: Chain.ETH,
  });
  await perfClient.addresses.checkSanctioned('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
    chain: Chain.ETH,
  });

  // Report performance
  console.log('\nPerformance Report:');
  for (const { endpoint, duration } of requestTimes) {
    const shortEndpoint = endpoint.split('?')[0].slice(-50);
    console.log(`  ${shortEndpoint}: ${duration}ms`);
  }
  const avgTime = requestTimes.reduce((sum, r) => sum + r.duration, 0) / requestTimes.length;
  console.log(`  Average: ${avgTime.toFixed(0)}ms`);
}

main().catch(console.error);
