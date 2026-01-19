import { WebacyClientConfig, DEFAULT_CONFIG, buildBaseUrl } from './config';
import {
  HttpClient,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './http';
import { AuthenticationError } from './errors';
import { Chain } from './types';

/**
 * Base client class for Webacy SDK
 *
 * Provides shared functionality for all Webacy client implementations
 * including HTTP client setup, authentication, and interceptors.
 */
export abstract class BaseClient {
  protected readonly httpClient: HttpClient;
  protected readonly config: Required<
    Pick<WebacyClientConfig, 'baseUrl' | 'apiVersion' | 'timeout'>
  > &
    WebacyClientConfig;

  /**
   * Default chain to use when chain is not specified in API calls
   */
  public readonly defaultChain?: Chain;

  constructor(config: WebacyClientConfig) {
    if (!config.apiKey) {
      throw new AuthenticationError('API key is required');
    }

    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_CONFIG.baseUrl,
      apiVersion: config.apiVersion ?? DEFAULT_CONFIG.apiVersion,
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    };

    this.defaultChain = config.defaultChain;

    this.httpClient = new HttpClient({
      baseUrl: buildBaseUrl(this.config),
      timeout: this.config.timeout,
      retry: config.retry,
      debug: config.debug,
      logger: config.logger,
      headers: {
        'x-api-key': config.apiKey,
        ...config.headers,
      },
    });
  }

  /**
   * Add a request interceptor
   *
   * Request interceptors are called before each request is sent.
   * Use them to modify requests, add headers, or log requests.
   *
   * @example
   * ```typescript
   * client.addRequestInterceptor((url, config) => {
   *   console.log(`Making request to ${url}`);
   *   return config;
   * });
   * ```
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.httpClient.addRequestInterceptor(interceptor);
  }

  /**
   * Add a response interceptor
   *
   * Response interceptors are called after each successful response.
   * Use them to transform responses or log data.
   *
   * @example
   * ```typescript
   * client.addResponseInterceptor((response) => {
   *   console.log(`Received ${response.status} response`);
   *   return response;
   * });
   * ```
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.httpClient.addResponseInterceptor(interceptor);
  }

  /**
   * Add an error interceptor
   *
   * Error interceptors are called when a request fails.
   * Use them to handle errors globally or transform error types.
   *
   * @example
   * ```typescript
   * client.addErrorInterceptor((error) => {
   *   if (error instanceof RateLimitError) {
   *     console.warn('Rate limited, will retry...');
   *   }
   *   return error;
   * });
   * ```
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.httpClient.addErrorInterceptor(interceptor);
  }

  /**
   * Make a GET request
   */
  protected get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.httpClient.get<T>(path, {
      timeout: options?.timeout,
      signal: options?.signal,
    });
  }

  /**
   * Make a POST request
   */
  protected post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.httpClient.post<T>(path, body, {
      timeout: options?.timeout,
      signal: options?.signal,
    });
  }

  /**
   * Make a PUT request
   */
  protected put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    return this.httpClient.put<T>(path, body, {
      timeout: options?.timeout,
      signal: options?.signal,
    });
  }

  /**
   * Make a DELETE request
   */
  protected delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.httpClient.delete<T>(path, {
      timeout: options?.timeout,
      signal: options?.signal,
    });
  }
}

/**
 * Options for protected request methods
 */
interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
}
