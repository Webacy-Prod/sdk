---
sidebar_position: 3
---

# Authentication

All API requests require an API key for authentication.

## Getting an API Key

1. Sign up at [webacy.com](https://webacy.com)
2. Navigate to your dashboard
3. Create a new API key
4. Copy the key (it's only shown once)

## Using Your API Key

### Environment Variables (Recommended)

Store your API key in environment variables:

```bash
# .env
WEBACY_API_KEY=your_api_key_here
```

Then use it in your code:

```typescript
import { WebacyClient } from '@webacy/sdk';

const client = new WebacyClient({
  apiKey: process.env.WEBACY_API_KEY!,
});
```

### Direct Configuration

For testing or simple scripts:

```typescript
const client = new WebacyClient({
  apiKey: 'your_api_key_here',
});
```

:::warning
Never commit API keys to version control. Use environment variables or secret management tools.
:::

## Configuration Options

```typescript
import { WebacyClient } from '@webacy/sdk';

const client = new WebacyClient({
  // Required
  apiKey: process.env.WEBACY_API_KEY!,

  // Optional
  baseUrl: 'https://api.webacy.com',  // Custom API endpoint
  timeout: 30000,                      // Request timeout in ms

  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },

  // Custom headers
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

## Rate Limits

API keys have rate limits based on your plan:

| Plan | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 10 | 100 |
| Pro | 60 | 10,000 |
| Enterprise | Unlimited | Unlimited |

When you hit a rate limit, the SDK throws a `RateLimitError`:

```typescript
import { RateLimitError } from '@webacy/sdk';

try {
  const risk = await client.threat.addresses.analyze('0x...', { chain: 'eth' });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  }
}
```

## Checking Usage

Monitor your API usage:

```typescript
// Get current usage
const current = await client.threat.usage.getCurrent();
console.log(`Requests today: ${current.requests_today}`);
console.log(`Limit: ${current.daily_limit}`);

// Get historical usage
const history = await client.threat.usage.getUsage({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
});
```
