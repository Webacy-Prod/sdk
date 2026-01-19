/**
 * Address Risk Analysis Example
 *
 * Demonstrates comprehensive address risk scoring,
 * including fund flow analysis and risk categorization.
 */

import { ThreatClient, RiskModule } from '@webacy/sdk-threat';

async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example: Analyze an Ethereum address
  const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  console.log('Analyzing address risk...');
  const risk = await client.addresses.analyze(address, {
    chain: 'eth',
    detailed: true,
  });

  console.log('\n=== Address Risk Analysis ===');
  console.log(`Address: ${address}`);
  console.log(`Overall Risk Score: ${risk.overallRisk}/100`);
  console.log(`Is Contract: ${risk.isContract}`);
  console.log(`Address Type: ${risk.addressType}`);

  // Risk Issue Summary
  console.log('\nRisk Issues:');
  console.log(`  Total Issues: ${risk.count}`);
  console.log(`  Medium Severity: ${risk.medium}`);
  console.log(`  High Severity: ${risk.high}`);

  // Risk Tags
  if (risk.issues && risk.issues.length > 0) {
    console.log('\nRisk Tags:');
    for (const issue of risk.issues) {
      console.log(`  - Score: ${issue.score}`);
      if (issue.tags) {
        for (const tag of issue.tags) {
          console.log(`    Tag: ${tag}`);
        }
      }
    }
  }

  // Context (informational, non-risk)
  if (risk.context && risk.context.length > 0) {
    console.log('\nContext Tags:');
    for (const ctx of risk.context) {
      console.log(`  - ${ctx}`);
    }
  }

  // Detailed analysis
  if (risk.details) {
    console.log('\nDetailed Analysis:');

    if (risk.details.address_info) {
      const info = risk.details.address_info;
      console.log('  Address Info:');
      if (info.name) console.log(`    Name: ${info.name}`);
      if (info.category) console.log(`    Category: ${info.category}`);
      if (info.is_exchange) console.log(`    Is Exchange: ${info.is_exchange}`);
    }

    if (risk.details.fund_flows?.risk) {
      const flowRisk = risk.details.fund_flows.risk;
      console.log('  Fund Flow Risks:');
      if (flowRisk.ofac) console.log('    ⚠️  Connected to OFAC sanctioned addresses');
      if (flowRisk.hacker) console.log('    ⚠️  Connected to known hackers');
      if (flowRisk.mixers) console.log('    ⚠️  Used coin mixing services');
      if (flowRisk.tornado) console.log('    ⚠️  Used Tornado Cash');
      if (flowRisk.drainer) console.log('    ⚠️  Connected to drainer contracts');
    }
  }

  // Modules analyzed
  if (risk.analysis_modules && risk.analysis_modules.length > 0) {
    console.log('\nModules Analyzed:');
    for (const module of risk.analysis_modules) {
      console.log(`  - ${module}`);
    }
  }

  // Example: Analyze with specific modules
  console.log('\n\n--- Running targeted analysis ---');
  const targetedRisk = await client.addresses.analyze(address, {
    chain: 'eth',
    modules: [RiskModule.FUND_FLOW_SCREENING, RiskModule.SANCTIONS_COMPLIANCE],
  });

  console.log(`\nTargeted Analysis Score: ${targetedRisk.overallRisk}/100`);
  console.log(`Modules Used: ${targetedRisk.analysis_modules?.join(', ')}`);
}

main().catch(console.error);
