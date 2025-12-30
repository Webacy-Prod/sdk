# Debugging & Logging

The Webacy SDK includes built-in debug logging to help troubleshoot API interactions.

## Enabling Debug Mode

Enable debug logging when creating your client:

```typescript
import { ThreatClient } from '@webacy/sdk';

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  debug: true, // Enable all logging
});
```

## Debug Modes

Control what gets logged with granular debug modes:

| Mode | Description |
|------|-------------|
| `true` or `'all'` | Log requests, responses, and errors |
| `'requests'` | Log only outgoing requests |
| `'responses'` | Log only successful responses |
| `'errors'` | Log only errors |
| `false` | Disable logging (default) |

```typescript
// Log only requests
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  debug: 'requests',
});

// Log only errors
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  debug: 'errors',
});
```

## Log Output

When enabled, the SDK logs to the console with the `[Webacy SDK]` prefix:

```
[Webacy SDK] → GET https://api.webacy.com/addresses/0x742d35...?chain=eth
[Webacy SDK] ← GET https://api.webacy.com/addresses/0x742d35...?chain=eth 200 (245ms)
```

Error logs include additional context:

```
[Webacy SDK] ✗ GET https://api.webacy.com/addresses/invalid - VALIDATION_ERROR: Invalid address
```

## Custom Logger

Integrate with your logging system (winston, pino, etc.):

```typescript
import { ThreatClient, Logger } from '@webacy/sdk';
import pino from 'pino';

// Create a pino logger
const pinoLogger = pino({ level: 'debug' });

// Adapt it to the SDK's Logger interface
const customLogger: Logger = {
  debug: (msg, data) => pinoLogger.debug(data, msg),
  info: (msg, data) => pinoLogger.info(data, msg),
  warn: (msg, data) => pinoLogger.warn(data, msg),
  error: (msg, data) => pinoLogger.error(data, msg),
};

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  debug: true,
  logger: customLogger,
});
```

### Winston Example

```typescript
import { ThreatClient, Logger } from '@webacy/sdk';
import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const customLogger: Logger = {
  debug: (msg, data) => winstonLogger.debug(msg, { data }),
  info: (msg, data) => winstonLogger.info(msg, { data }),
  warn: (msg, data) => winstonLogger.warn(msg, { data }),
  error: (msg, data) => winstonLogger.error(msg, { data }),
};

const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
  debug: 'all',
  logger: customLogger,
});
```

## Sensitive Data Redaction

The SDK automatically redacts sensitive data in logs:

- `apiKey` → `[REDACTED]`
- `api_key` → `[REDACTED]`
- `secret` → `[REDACTED]`
- `password` → `[REDACTED]`
- `token` → `[REDACTED]`

Your API key is never logged, even with debug mode enabled.

## Using Interceptors for Debugging

For more control, use request/response interceptors:

```typescript
const client = new ThreatClient({
  apiKey: process.env.WEBACY_API_KEY!,
});

// Log request details
client.addRequestInterceptor((url, config) => {
  console.log(`[Request] ${config.method} ${url}`);
  console.log(`[Headers]`, config.headers);
  return config;
});

// Log response details
client.addResponseInterceptor((response) => {
  console.log(`[Response] Status: ${response.status}`);
  console.log(`[Request ID] ${response.requestId}`);
  return response;
});

// Log errors with full context
client.addErrorInterceptor((error) => {
  console.error(`[Error] ${error.code}: ${error.message}`);
  console.error(`[Endpoint] ${error.endpoint}`);
  console.error(`[Request ID] ${error.requestId}`);
  return error;
});
```

## Performance Timing

Track request performance:

```typescript
client.addRequestInterceptor((url, config) => {
  (config as any)._startTime = Date.now();
  return config;
});

client.addResponseInterceptor((response) => {
  const config = response as any;
  if (config._startTime) {
    const duration = Date.now() - config._startTime;
    console.log(`Request took ${duration}ms`);
  }
  return response;
});
```

## Best Practices

1. **Use `debug: 'errors'` in production** - Log only errors to avoid noise
2. **Use `debug: true` in development** - See full request/response cycle
3. **Integrate with your logging stack** - Use custom logger for production
4. **Track request IDs** - Include in error reports for support
5. **Monitor response times** - Use interceptors to track performance
