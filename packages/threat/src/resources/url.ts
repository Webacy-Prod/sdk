import { HttpClient, HttpResponse, ValidationError, isValidUrl } from '@webacy/sdk-core';
import { UrlRiskResponse, UrlAddResponse, UrlCheckOptions } from '../types';

/**
 * Resource for URL safety analysis
 *
 * Provides URL risk assessment to identify phishing sites,
 * malicious domains, and other web-based threats.
 *
 * @example
 * ```typescript
 * const result = await client.url.check('https://suspicious-site.com');
 * if (result.prediction === 'malicious') {
 *   console.warn('URL is malicious!');
 * }
 * ```
 */
export class UrlResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Check if a URL is safe
   *
   * Analyzes a URL for phishing, malware, and other threats.
   *
   * @param url - URL to check
   * @param options - Request options
   * @returns URL safety analysis result
   *
   * @example
   * ```typescript
   * const result = await client.url.check('https://example.com');
   *
   * if (result.prediction === 'malicious') {
   *   console.error('URL is potentially dangerous!');
   *   console.log('Details:', result.details);
   * } else if (result.prediction === 'benign') {
   *   console.log('URL appears safe');
   * }
   *
   * // Check blacklist/whitelist status
   * if (result.blacklist === 'true') {
   *   console.error('URL is blacklisted');
   * }
   * if (result.whitelist === 'true') {
   *   console.log('URL is whitelisted');
   * }
   * ```
   */
  async check(url: string, options?: UrlCheckOptions): Promise<UrlRiskResponse> {
    if (!isValidUrl(url)) {
      throw new ValidationError(
        `Invalid URL: "${url}". Please provide a valid HTTP or HTTPS URL.`
      );
    }

    const response: HttpResponse<UrlRiskResponse> = await this.httpClient.post(
      '/url',
      { url },
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }

  /**
   * Add a URL to the database
   *
   * Report a URL to be analyzed and added to the threat database.
   *
   * @param url - URL to add
   * @param options - Request options
   * @returns Addition result
   *
   * @example
   * ```typescript
   * const result = await client.url.add('https://phishing-site.com');
   * if (result.success) {
   *   console.log('URL reported successfully');
   * }
   * ```
   */
  async add(url: string, options?: UrlCheckOptions): Promise<UrlAddResponse> {
    if (!isValidUrl(url)) {
      throw new ValidationError(
        `Invalid URL: "${url}". Please provide a valid HTTP or HTTPS URL.`
      );
    }

    const response: HttpResponse<UrlAddResponse> = await this.httpClient.post(
      '/url/add',
      { url },
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }
}
