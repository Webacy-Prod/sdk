/**
 * Sanctions Check Example
 *
 * Demonstrates how to screen addresses against sanctions lists
 * and detect address poisoning attacks.
 */

import { ThreatClient } from '@webacy/sdk-threat';

async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example addresses to check
  const addresses = [
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    '0x8589427373D6D84E98730D7795D8f6f8731FDA16', // Known Tornado Cash address
  ];

  console.log('=== Sanctions Screening ===\n');

  for (const address of addresses) {
    console.log(`Checking: ${address}`);

    try {
      const result = await client.addresses.checkSanctioned(address, {
        chain: 'eth',
      });

      if (result.is_sanctioned) {
        console.log('  ⛔ SANCTIONED');
        if (result.sanction_details) {
          console.log(`     Source: ${result.sanction_details.source}`);
          console.log(`     List: ${result.sanction_details.list_name}`);
          console.log(`     Date Added: ${result.sanction_details.date_added}`);
        }
      } else {
        console.log('  ✅ Not sanctioned');
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }

  // Address Poisoning Check
  console.log('\n=== Address Poisoning Detection ===\n');

  const targetAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  console.log(`Checking for poisoning: ${targetAddress}`);

  try {
    const poisoning = await client.addresses.checkPoisoning(targetAddress, {
      chain: 'eth',
    });

    if (poisoning.is_poisoned) {
      console.log('  ⚠️  ADDRESS POISONING DETECTED');
      if (poisoning.poisoning_details) {
        console.log(
          `     Similar addresses: ${poisoning.poisoning_details.similar_addresses?.length || 0}`
        );
        console.log(`     Dust transactions: ${poisoning.poisoning_details.dust_tx_count || 0}`);
        console.log(`     First seen: ${poisoning.poisoning_details.first_seen || 'Unknown'}`);

        if (
          poisoning.poisoning_details.similar_addresses &&
          poisoning.poisoning_details.similar_addresses.length > 0
        ) {
          console.log('     Watch out for these similar addresses:');
          for (const addr of poisoning.poisoning_details.similar_addresses.slice(0, 3)) {
            console.log(`       - ${addr}`);
          }
        }
      }
    } else {
      console.log('  ✅ No poisoning detected');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

main().catch(console.error);
