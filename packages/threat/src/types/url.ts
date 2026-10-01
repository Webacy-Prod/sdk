/**
 * URL risk level returned by `POST /url`.
 *
 * - `high`: a known phishing or blocklisted site, from Webacy's database or a
 *   real-time phishing feed.
 * - `medium`: not listed, but similar to a known project's domain (possible
 *   impersonation).
 * - `low`: a known project's site.
 * - `unknown`: no verdict. Treat as unverified, never as safe.
 */
export type UrlRiskLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * URL risk analysis response (`POST /url`)
 */
export interface UrlRiskResponse {
  /** Risk verdict for the URL's host */
  riskLevel: UrlRiskLevel;
  /** Human-readable explanation of the verdict */
  description: string;
  /** Where to report a wrong verdict */
  message: string;
}

/**
 * URL addition response
 */
export interface UrlAddResponse {
  /** Whether URL was added successfully */
  success: boolean;
  /** Message */
  message?: string;
}

/**
 * Options for URL check requests
 */
export interface UrlCheckOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
