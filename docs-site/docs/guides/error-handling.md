# Error Handling

The Webacy SDK provides comprehensive error handling with typed exceptions and recovery suggestions.

## Error Types

All SDK errors extend `WebacyError`, making it easy to catch and handle them:

```typescript
import {
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '@webacy-xyz/sdk';
```

### AuthenticationError

Thrown when the API key is invalid or missing.

```typescript
try {
  const risk = await client.addresses.analyze('0x...');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key:', error.message);
    console.log('Suggestion:', error.getRecoverySuggestion());
    // "Check that your API key is valid and has not expired..."
  }
}
```

### RateLimitError

Thrown when you've exceeded your API rate limit.

```typescript
try {
  const risk = await client.addresses.analyze('0x...');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limited:', error.message);

    // Wait for the suggested retry time
    if (error.retryAfter) {
      console.log(`Retry after ${error.retryAfter} seconds`);
      await sleep(error.retryAfter * 1000);
    }

    // Or check the reset timestamp
    if (error.resetAt) {
      const resetDate = new Date(error.resetAt * 1000);
      console.log(`Rate limit resets at: ${resetDate}`);
    }
  }
}
```

### ValidationError

Thrown when input validation fails (e.g., invalid address format).

```typescript
try {
  const risk = await client.addresses.analyze('invalid-address', {
    chain: Chain.ETH,
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    // "Invalid Ethereum address: "invalid-address"..."

    // Check field-specific errors if available
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        console.error(`${field}: ${messages.join(', ')}`);
      }
    }
  }
}
```

### NotFoundError

Thrown when a requested resource doesn't exist.

```typescript
try {
  const risk = await client.addresses.analyze('0x0000...', {
    chain: Chain.ETH,
  });
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Not found:', error.message);
    console.log('Suggestion:', error.getRecoverySuggestion());
    // "Verify the address exists on the specified chain..."
  }
}
```

### NetworkError

Thrown for network-related failures (timeouts, connectivity issues).

```typescript
try {
  const risk = await client.addresses.analyze('0x...');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);

    // NetworkError is retryable by default
    if (error.isRetryable()) {
      console.log('This error can be retried');
    }
  }
}
```

## Error Properties

All errors include helpful properties for debugging:

```typescript
try {
  const risk = await client.addresses.analyze('0x...');
} catch (error) {
  if (error instanceof WebacyError) {
    console.log('Error code:', error.code);       // e.g., 'AUTHENTICATION_ERROR'
    console.log('HTTP status:', error.status);    // e.g., 401
    console.log('Request ID:', error.requestId);  // For support tickets
    console.log('Endpoint:', error.endpoint);     // The API endpoint that failed
    console.log('Retryable:', error.isRetryable());
    console.log('Suggestion:', error.getRecoverySuggestion());
  }
}
```

## Global Error Handling with Interceptors

Use error interceptors for centralized error handling:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Add global error handling
client.addErrorInterceptor((error) => {
  // Log all errors to your monitoring service
  logToSentry(error);

  // Transform or enrich errors
  if (error instanceof RateLimitError) {
    notifySlack('Rate limit hit - check API usage');
  }

  // Must return the error
  return error;
});
```

## Retry Configuration

Configure automatic retries for transient failures:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  retry: {
    maxRetries: 3,              // Retry up to 3 times
    initialDelay: 1000,         // Start with 1 second delay
    maxDelay: 30000,            // Max 30 second delay
    backoffFactor: 2,           // Double delay each retry
    retryableStatuses: [429, 500, 502, 503, 504],
  },
});
```

## Best Practices

1. **Always handle ValidationError** - Client-side validation helps catch issues before making API calls
2. **Implement rate limit handling** - Use the `retryAfter` property to implement proper backoff
3. **Log request IDs** - Include `requestId` in your logs for easier debugging with support
4. **Use interceptors for monitoring** - Centralize error tracking with error interceptors
5. **Check `isRetryable()`** - Only retry errors that can be retried

## Complete Example

```typescript
import {
  ThreatClient,
  Chain,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
} from '@webacy-xyz/sdk';

const MAX_RATE_LIMIT_RETRIES = 3;

async function analyzeAddressSafely(
  address: string,
  retries = 0
): Promise<AddressRiskResponse | null> {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    retry: { maxRetries: 3 }, // SDK handles network error retries
  });

  try {
    return await client.addresses.analyze(address, { chain: Chain.ETH });
  } catch (error) {
    if (error instanceof ValidationError) {
      // Invalid input - don't retry
      console.error('Invalid address format:', error.message);
      return null;
    }

    if (error instanceof AuthenticationError) {
      // Auth issue - check API key
      console.error('Authentication failed:', error.getRecoverySuggestion());
      throw error; // Re-throw to handle at app level
    }

    if (error instanceof RateLimitError) {
      // Check retry limit to prevent infinite recursion
      if (retries >= MAX_RATE_LIMIT_RETRIES) {
        console.error(
          `Rate limit retry limit (${MAX_RATE_LIMIT_RETRIES}) exceeded`
        );
        return null;
      }

      // Rate limited - wait and retry with incremented counter
      const waitTime = (error.retryAfter ?? 60) * 1000;
      console.warn(
        `Rate limited, waiting ${waitTime}ms (retry ${retries + 1}/${MAX_RATE_LIMIT_RETRIES})...`
      );
      await sleep(waitTime);
      return analyzeAddressSafely(address, retries + 1);
    }

    if (error instanceof NetworkError) {
      // Network issue - already retried by SDK
      console.error('Network error after retries:', error.message);
      return null;
    }

    // Unknown error
    console.error('Unexpected error:', error);
    throw error;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
