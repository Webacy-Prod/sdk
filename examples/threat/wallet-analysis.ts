/**
 * Wallet Analysis Example
 *
 * Demonstrates how to analyze wallet transactions
 * and token approvals for security risks.
 */

import { ThreatClient } from '@webacy-xyz/sdk-threat';

/** Runs wallet analysis examples. */
async function main() {
  const client = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  // Get wallet transactions
  console.log('=== Wallet Transactions ===\n');
  console.log(`Wallet: ${walletAddress}`);

  try {
    const transactions = await client.wallets.getTransactions(walletAddress, {
      chain: 'eth',
      limit: 10,
    });

    console.log(`\nRecent Transactions: ${transactions.transactions?.length || 0}`);

    if (transactions.transactions && transactions.transactions.length > 0) {
      for (const tx of transactions.transactions.slice(0, 5)) {
        console.log(`\n  Hash: ${tx.hash}`);
        console.log(`  Type: ${tx.type}`);
        console.log(`  From: ${tx.from}`);
        console.log(`  To: ${tx.to}`);
        console.log(`  Value: ${tx.value}`);

        if (tx.risk_score !== undefined) {
          console.log(`  Risk Score: ${tx.risk_score}/100`);
          if (tx.risk_score > 50) {
            console.log(`  ⚠️  High risk transaction`);
          }
        }
      }
    }

    // Summary stats
    if (transactions.summary) {
      console.log('\nTransaction Summary:');
      console.log(`  Total Transactions: ${transactions.summary.total_count}`);
      console.log(`  Total Value: ${transactions.summary.total_value}`);
      console.log(`  Unique Counterparties: ${transactions.summary.unique_addresses}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get token approvals
  console.log('\n\n=== Token Approvals ===\n');

  try {
    const approvals = await client.wallets.getApprovals(walletAddress, {
      chain: 'eth',
    });

    console.log(`Active Approvals: ${approvals.approvals?.length || 0}`);

    if (approvals.approvals && approvals.approvals.length > 0) {
      // Group by risk level
      const highRisk = approvals.approvals.filter((a) => a.risk_score && a.risk_score > 70);
      const mediumRisk = approvals.approvals.filter(
        (a) => a.risk_score && a.risk_score > 40 && a.risk_score <= 70
      );
      const lowRisk = approvals.approvals.filter((a) => !a.risk_score || a.risk_score <= 40);

      if (highRisk.length > 0) {
        console.log(`\n⛔ High Risk Approvals (${highRisk.length}):`);
        for (const approval of highRisk) {
          console.log(`  Token: ${approval.token_symbol || approval.token_address}`);
          console.log(`  Spender: ${approval.spender}`);
          console.log(`  Amount: ${approval.amount === 'unlimited' ? '∞ UNLIMITED' : approval.amount}`);
          console.log(`  Risk: ${approval.risk_score}/100`);
          console.log('');
        }
      }

      if (mediumRisk.length > 0) {
        console.log(`\n⚠️  Medium Risk Approvals (${mediumRisk.length}):`);
        for (const approval of mediumRisk.slice(0, 3)) {
          console.log(`  Token: ${approval.token_symbol || approval.token_address}`);
          console.log(`  Spender: ${approval.spender}`);
          console.log(`  Risk: ${approval.risk_score}/100`);
        }
      }

      if (lowRisk.length > 0) {
        console.log(`\n✅ Low Risk Approvals: ${lowRisk.length}`);
      }

      // Total exposure
      if (approvals.total_exposure_usd !== undefined) {
        console.log(`\nTotal Exposure: $${approvals.total_exposure_usd.toLocaleString()}`);
      }
    } else {
      console.log('No active approvals found');
    }
  } catch (error) {
    console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

main().catch(console.error);
