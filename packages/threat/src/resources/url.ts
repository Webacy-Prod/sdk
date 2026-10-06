import {
  BaseResource,
  HttpResponse,
  ValidationError,
  isValidUrl,
  normalizeUrl,
  Chain,
} from '@webacy-xyz/sdk-core';
import { UrlRiskResponse, UrlAddResponse, UrlCheckOptions } from '../types';

/**
 * Resource for URL safety analysis
 *
 * Provides URL risk assessment to identify phishing sites,
 * malicious domains, and other web-based threats.
 *
 * Note: URL analysis is chain-agnostic, so the chain parameter is not used.
 *
 * @example
 * ```typescript
 * const result = await client.url.check('https://suspicious-site.com');
 * if (result.riskLevel === 'high') {
 *   console.warn(`Blocked: ${result.description}`);
 * }
 * ```
 */
export class UrlResource extends BaseResource {
  // Note: URL analysis is chain-agnostic, defaultChain is accepted for interface consistency
  constructor(httpClient: import('@webacy-xyz/sdk-core').HttpClient, _defaultChain?: Chain) {
    super(httpClient, _defaultChain);
  }

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
   * switch (result.riskLevel) {
   *   case 'high': // known phishing / blocklisted
   *     console.error(`Block: ${result.description}`);
   *     break;
   *   case 'medium': // looks like a known project's domain
   *     console.warn(`Possible impersonation: ${result.description}`);
   *     break;
   *   case 'low': // a known project's site
   *     console.log('Known project site');
   *     break;
   *   default: // 'unknown': no verdict, treat as unverified
   *     console.log('Unverified site');
   * }
   * ```
   */
  async check(url: string, options?: UrlCheckOptions): Promise<UrlRiskResponse> {
    url = normalizeUrl(url);
    if (!isValidUrl(url)) {
      throw new ValidationError(`Invalid URL: "${url}". Please provide a valid HTTP or HTTPS URL.`);
    }

    const response: HttpResponse<UrlRiskResponse> = await this.httpClient.post(
      '/url',
      { url },
      this.requestOptions(options)
    );

    return response.data;
  }

  /**
   * Add a URL to the database
   *
   * Report a URL to be analyzed and added to the threat database.
   *
   * @deprecated `POST /url/add` is not exposed on the public API
   * (`api.webacy.com` answers 403 for it), so this call fails with an API key.
   * Report a wrong verdict through the link in `UrlRiskResponse.message`.
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
    url = normalizeUrl(url);
    if (!isValidUrl(url)) {
      throw new ValidationError(`Invalid URL: "${url}". Please provide a valid HTTP or HTTPS URL.`);
    }

    const response: HttpResponse<UrlAddResponse> = await this.httpClient.post(
      '/url/add',
      { url },
      this.requestOptions(options)
    );

    return response.data;
  }
}
