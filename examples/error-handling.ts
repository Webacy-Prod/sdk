/**
 * Error Handling Examples
 *
 * This example demonstrates comprehensive error handling patterns
 * with the Webacy SDK.
 */

import {
  ThreatClient,
  Chain,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '@webacy/sdk';

// Helper function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
    },
  });

  // Example 1: Basic error handling
  console.log('\n=== Example 1: Basic Error Handling ===');
  try {
    const risk = await client.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', {
      chain: Chain.ETH,
    });
    console.log('Risk score:', risk.overallRisk);
  } catch (error) {
    if (error instanceof WebacyError) {
      console.error('API Error:', error.message);
      console.error('Error code:', error.code);
      console.error('HTTP status:', error.status);
    } else {
      throw error;
    }
  }

  // Example 2: Handle specific error types
  console.log('\n=== Example 2: Specific Error Types ===');
  try {
    // This will throw ValidationError due to invalid address
    await client.addresses.analyze('invalid-address', {
      chain: Chain.ETH,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
      console.error('Recovery suggestion:', error.getRecoverySuggestion());
    } else if (error instanceof AuthenticationError) {
      console.error('Auth failed - check your API key');
    } else if (error instanceof RateLimitError) {
      console.error('Rate limited - try again later');
      if (error.retryAfter) {
        console.log(`Retry after ${error.retryAfter} seconds`);
      }
    } else if (error instanceof NetworkError) {
      console.error('Network error - check connectivity');
    }
  }

  // Example 3: Rate limit handling with automatic retry
  console.log('\n=== Example 3: Rate Limit Handling ===');
  async function analyzeWithRetry(address: string, maxAttempts = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await client.addresses.analyze(address, { chain: Chain.ETH });
        console.log(`Success on attempt ${attempt}:`, result.overallRisk);
        return;
      } catch (error) {
        if (error instanceof RateLimitError && attempt < maxAttempts) {
          const waitTime = (error.retryAfter ?? 60) * 1000;
          console.log(`Rate limited, waiting ${waitTime / 1000}s before retry...`);
          await sleep(waitTime);
        } else {
          throw error;
        }
      }
    }
  }

  // Example 4: Using error interceptors
  console.log('\n=== Example 4: Error Interceptors ===');
  const monitoredClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Add error interceptor for monitoring
  monitoredClient.addErrorInterceptor((error) => {
    // Log all errors
    console.log('[Monitor] Error occurred:', {
      code: error.code,
      message: error.message,
      requestId: error.requestId,
      endpoint: error.endpoint,
    });

    // You could send to monitoring service here
    // sendToDatadog(error);
    // sendToSentry(error);

    return error;
  });

  try {
    await monitoredClient.addresses.analyze('invalid', { chain: Chain.ETH });
  } catch {
    // Error was logged by interceptor
  }

  // Example 5: Graceful degradation
  console.log('\n=== Example 5: Graceful Degradation ===');
  async function analyzeWithFallback(address: string): Promise<{ risk: number | null; cached: boolean }> {
    try {
      const result = await client.addresses.analyze(address, { chain: Chain.ETH });
      return { risk: result.overallRisk ?? null, cached: false };
    } catch (error) {
      if (error instanceof NetworkError || error instanceof RateLimitError) {
        // Return cached/default data instead of failing
        console.log('Using fallback due to:', error.code);
        return { risk: null, cached: true };
      }
      throw error;
    }
  }

  const fallbackResult = await analyzeWithFallback('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
  console.log('Result:', fallbackResult);

  // Example 6: Check error properties
  console.log('\n=== Example 6: Error Properties ===');
  try {
    await client.addresses.analyze('invalid', { chain: Chain.ETH });
  } catch (error) {
    if (error instanceof WebacyError) {
      console.log('All error properties:');
      console.log('  - name:', error.name);
      console.log('  - message:', error.message);
      console.log('  - code:', error.code);
      console.log('  - status:', error.status);
      console.log('  - requestId:', error.requestId);
      console.log('  - endpoint:', error.endpoint);
      console.log('  - isRetryable:', error.isRetryable());
      console.log('  - suggestion:', error.getRecoverySuggestion());
    }
  }
}

main().catch(console.error);
