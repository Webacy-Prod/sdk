/**
 * Contract Analysis Example
 *
 * Demonstrates smart contract security analysis,
 * including vulnerability detection and tax analysis.
 */

import { ThreatClient } from '@webacy-xyz/sdk-threat';

/** Runs contract analysis examples. */
async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example: Analyze a token contract
  const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT

  console.log('=== Contract Risk Analysis ===\n');
  console.log(`Analyzing: ${contractAddress}`);

  try {
    const risk = await client.contracts.analyze(contractAddress, {
      chain: 'eth',
    });

    console.log(`\nOverall Risk Score: ${risk.overallRisk}/100`);
    console.log(`Contract Verified: ${risk.is_verified}`);

    // Vulnerabilities
    if (risk.vulnerabilities && risk.vulnerabilities.length > 0) {
      console.log('\nVulnerabilities Found:');
      for (const vuln of risk.vulnerabilities) {
        console.log(`  - ${vuln.name}`);
        console.log(`    Severity: ${vuln.severity}`);
        console.log(`    Description: ${vuln.description}`);
      }
    } else {
      console.log('\n✅ No vulnerabilities detected');
    }

    // Security Features
    if (risk.security_features) {
      console.log('\nSecurity Features:');
      console.log(`  Proxy Contract: ${risk.security_features.is_proxy}`);
      console.log(`  Upgradeable: ${risk.security_features.is_upgradeable}`);
      console.log(`  Has Mint Function: ${risk.security_features.has_mint}`);
      console.log(`  Has Blacklist: ${risk.security_features.has_blacklist}`);
      console.log(`  Has Whitelist: ${risk.security_features.has_whitelist}`);
      console.log(`  Has Trading Cooldown: ${risk.security_features.has_trading_cooldown}`);
    }

    // Ownership
    if (risk.ownership) {
      console.log('\nOwnership Info:');
      console.log(`  Owner: ${risk.ownership.owner}`);
      console.log(`  Renounced: ${risk.ownership.is_renounced}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get source code
  console.log('\n\n=== Contract Source Code ===\n');

  try {
    const source = await client.contracts.getSourceCode(contractAddress, {
      chain: 'eth',
    });

    console.log(`Contract Name: ${source.contract_name}`);
    console.log(`Compiler Version: ${source.compiler_version}`);
    console.log(`Verified: ${source.is_verified}`);
    console.log(`License: ${source.license || 'Not specified'}`);

    if (source.source_code) {
      console.log(`\nSource Code Preview (first 500 chars):`);
      console.log(source.source_code.substring(0, 500) + '...');
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get buy/sell taxes
  console.log('\n\n=== Token Taxes ===\n');

  try {
    const taxes = await client.contracts.getTaxes(contractAddress, {
      chain: 'eth',
    });

    console.log(`Buy Tax: ${taxes.buy_tax}%`);
    console.log(`Sell Tax: ${taxes.sell_tax}%`);
    console.log(`Transfer Tax: ${taxes.transfer_tax}%`);

    if (taxes.buy_tax > 5 || taxes.sell_tax > 5) {
      console.log('\n⚠️  Warning: High taxes detected (>5%)');
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

main().catch(console.error);
