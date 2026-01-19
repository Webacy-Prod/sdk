/**
 * URL safety check response
 */
export interface UrlRiskResponse {
  /** Blacklist status */
  blacklist: string;
  /** Prediction result (benign/malicious) */
  prediction: string;
  /** Whitelist status */
  whitelist: string;
  /** Additional details */
  details?: {
    /** Confidence score */
    confidence?: number;
    /** Categories */
    categories?: string[];
    /** Threat type */
    threat_type?: string;
  };
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
