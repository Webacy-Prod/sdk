/**
 * URL Safety Check Example
 *
 * Demonstrates how to check URLs for phishing,
 * malware, and other security risks.
 */

import { ThreatClient } from '@webacy-xyz/sdk-threat';

/** Runs URL safety check examples. */
async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example URLs to check
  const urls = [
    'https://uniswap.org',
    'https://app.uniswap.org',
    'https://opensea.io',
    'https://suspicious-airdrop-claim.xyz',
  ];

  console.log('=== URL Safety Analysis ===\n');

  for (const url of urls) {
    console.log(`Checking: ${url}`);

    try {
      const result = await client.url.check(url);

      switch (result.riskLevel) {
        case 'high':
          console.log('  ⛔ HIGH RISK (known phishing or blocklisted)');
          break;
        case 'medium':
          console.log('  ⚠️  MEDIUM (similar to a known project, possible impersonation)');
          break;
        case 'low':
          console.log('  ✅ Known project site');
          break;
        default:
          console.log('  ❔ Unknown (no verdict, treat as unverified)');
      }
      console.log(`     ${result.description}`);
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }

}

main().catch(console.error);
