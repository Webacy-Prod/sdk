/**
 * URL Safety Check Example
 *
 * Demonstrates how to check URLs for phishing,
 * malware, and other security risks.
 */

import { ThreatClient } from '@webacy-xyz/sdk-threat';

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

      if (result.is_malicious) {
        console.log('  ⛔ MALICIOUS');
        console.log(`     Risk Score: ${result.risk_score}/100`);
        if (result.threat_types && result.threat_types.length > 0) {
          console.log(`     Threats: ${result.threat_types.join(', ')}`);
        }
        if (result.category) {
          console.log(`     Category: ${result.category}`);
        }
      } else {
        console.log('  ✅ Safe');
        console.log(`     Risk Score: ${result.risk_score}/100`);
      }

      // Additional details
      if (result.domain_info) {
        console.log('  Domain Info:');
        console.log(`     Age: ${result.domain_info.age_days || 'Unknown'} days`);
        console.log(`     Registrar: ${result.domain_info.registrar || 'Unknown'}`);
      }

      if (result.ssl_info) {
        console.log(`  SSL: ${result.ssl_info.is_valid ? 'Valid' : 'Invalid'}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }

  // Report a malicious URL
  console.log('\n=== Report Malicious URL ===\n');

  const maliciousUrl = 'https://fake-metamask-wallet.xyz';
  console.log(`Reporting: ${maliciousUrl}`);

  try {
    const reportResult = await client.url.add(maliciousUrl);

    if (reportResult.success) {
      console.log('  ✅ URL reported successfully');
      console.log(`     Report ID: ${reportResult.report_id || 'N/A'}`);
    } else {
      console.log('  ⚠️  URL report may have failed');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

main().catch(console.error);
