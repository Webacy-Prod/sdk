import {
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError,
} from '../errors';
import {
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
  calculateRetryDelay,
  isRetryableStatusCode,
  sleep,
} from './retry';
import { DebugMode, Logger, defaultLogger } from '../config';

/**
 * HTTP request configuration
 */
export interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  url: string,
  config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor<T = unknown> = (
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (error: WebacyError) => WebacyError | Promise<WebacyError>;

/**
 * HTTP client configuration
 */
export interface HttpClientConfig {
  /** Base URL for all requests */
  baseUrl: string;
  /** Default headers for all requests */
  headers?: Record<string, string>;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: Partial<RetryConfig>;
  /** Debug mode for logging */
  debug?: DebugMode;
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * HTTP client with retry support and interceptors
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeout: number;
  private readonly retryConfig: RetryConfig;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors: ErrorInterceptor[] = [];
  private readonly debug: DebugMode;
  private readonly logger: Logger;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    };
    this.defaultTimeout = config.timeout ?? 30000;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };
    this.debug = config.debug ?? false;
    this.logger = config.logger ?? defaultLogger;
  }

  /**
   * Check if request logging is enabled
   */
  private shouldLogRequests(): boolean {
    return this.debug === true || this.debug === 'all' || this.debug === 'requests';
  }

  /**
   * Check if response logging is enabled
   */
  private shouldLogResponses(): boolean {
    return this.debug === true || this.debug === 'all' || this.debug === 'responses';
  }

  /**
   * Check if error logging is enabled
   */
  private shouldLogErrors(): boolean {
    return this.debug === true || this.debug === 'all' || this.debug === 'errors';
  }

  /**
   * Log a request
   */
  private logRequest(method: string, url: string, body?: unknown): void {
    if (this.shouldLogRequests()) {
      this.logger.debug(`→ ${method} ${url}`, body ? { body: this.sanitizeBody(body) } : undefined);
    }
  }

  /**
   * Log a response
   */
  private logResponse(method: string, url: string, status: number, duration: number): void {
    if (this.shouldLogResponses()) {
      this.logger.debug(`← ${method} ${url} ${status} (${duration}ms)`);
    }
  }

  /**
   * Log an error
   */
  private logError(method: string, url: string, error: WebacyError): void {
    if (this.shouldLogErrors()) {
      this.logger.error(`✗ ${method} ${url} - ${error.code}: ${error.message}`, {
        code: error.code,
        status: error.status,
        requestId: error.requestId,
      });
    }
  }

  /**
   * Sanitize request body for logging (remove sensitive data)
   */
  private sanitizeBody(body: unknown): unknown {
    if (typeof body !== 'object' || body === null) {
      return body;
    }
    // Remove potentially sensitive fields from logs
    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveKeys = ['apiKey', 'api_key', 'secret', 'password', 'token'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...config, method: 'POST', body });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PUT', body });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PATCH', body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  /**
   * Make an HTTP request with retry support
   */
  private async request<T>(path: string, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(url, finalConfig);
    }

    let lastError: WebacyError | undefined;
    let attempt = 0;

    while (attempt <= this.retryConfig.maxRetries) {
      try {
        const response = await this.executeRequest<T>(url, finalConfig);

        // Apply response interceptors
        let finalResponse: HttpResponse<T> = response;
        for (const interceptor of this.responseInterceptors) {
          finalResponse = (await interceptor(finalResponse)) as HttpResponse<T>;
        }

        return finalResponse;
      } catch (error) {
        lastError = error instanceof WebacyError ? error : this.wrapError(error);

        // Apply error interceptors
        for (const interceptor of this.errorInterceptors) {
          lastError = await interceptor(lastError);
        }

        // Check if we should retry
        if (!lastError.isRetryable() || attempt >= this.retryConfig.maxRetries) {
          throw lastError;
        }

        // Calculate retry delay
        const retryAfter = lastError instanceof RateLimitError ? lastError.retryAfter : undefined;
        const delay = calculateRetryDelay(attempt, this.retryConfig, retryAfter);

        await sleep(delay);
        attempt++;
      }
    }

    throw lastError ?? new NetworkError('Request failed after all retries');
  }

  /**
   * Execute a single HTTP request
   */
  private async executeRequest<T>(
    url: string,
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const method = config.method ?? 'GET';
    const timeout = config.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const startTime = Date.now();

    // Log the outgoing request
    this.logRequest(method, url, config.body);

    // Combine abort signals if user provided one
    const signal = config.signal
      ? this.combineAbortSignals(config.signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      const requestId = response.headers.get('x-request-id') ?? undefined;

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.createErrorFromResponse(response, requestId, url);
        this.logError(method, url, error);
        throw error;
      }

      // Log successful response
      this.logResponse(method, url, response.status, duration);

      // Parse response body
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        requestId,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof WebacyError) {
        throw error;
      }

      // Handle fetch errors
      let networkError: NetworkError;
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          networkError = new NetworkError('Request timed out', { cause: error, endpoint: url });
        } else {
          networkError = new NetworkError(error.message, { cause: error, endpoint: url });
        }
      } else {
        networkError = new NetworkError('An unknown error occurred', { endpoint: url });
      }

      this.logError(method, url, networkError);
      throw networkError;
    }
  }

  /**
   * Create an appropriate error from an HTTP response
   */
  private async createErrorFromResponse(
    response: Response,
    requestId?: string,
    endpoint?: string
  ): Promise<WebacyError> {
    let errorBody: { message?: string; error?: string; errors?: Record<string, string[]> } = {};

    try {
      errorBody = (await response.json()) as typeof errorBody;
    } catch {
      // Ignore JSON parse errors
    }

    const message = errorBody.message ?? errorBody.error ?? response.statusText;

    switch (response.status) {
      case 401:
      case 403:
        return new AuthenticationError(message, { requestId, endpoint });

      case 404:
        return new NotFoundError(message, { requestId, endpoint });

      case 429: {
        const retryAfter = response.headers.get('retry-after');
        const resetAt = response.headers.get('x-ratelimit-reset');
        return new RateLimitError(message, {
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
          resetAt: resetAt ? parseInt(resetAt, 10) : undefined,
          requestId,
          endpoint,
        });
      }

      case 400:
        return new ValidationError(message, {
          errors: errorBody.errors,
          requestId,
          endpoint,
        });

      default:
        if (isRetryableStatusCode(response.status, this.retryConfig)) {
          return new NetworkError(message, {
            cause: new Error(`HTTP ${response.status}`),
            endpoint,
          });
        }
        return new WebacyError(message, {
          status: response.status,
          code: 'API_ERROR',
          requestId,
          endpoint,
        });
    }
  }

  /**
   * Wrap an unknown error in a WebacyError
   */
  private wrapError(error: unknown): WebacyError {
    if (error instanceof WebacyError) {
      return error;
    }
    if (error instanceof Error) {
      return new NetworkError(error.message, { cause: error });
    }
    return new NetworkError('An unknown error occurred');
  }

  /**
   * Combine multiple abort signals
   */
  private combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort(signal.reason);
        break;
      }
      signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
    }

    return controller.signal;
  }
}
