/**
 * End-to-end integration test verifying the core audit pipeline,
 * fallback resilience, formatting, and data structures.
 */

import {
  getTokenApprovals,
  getTokenBalances,
  getTransactions,
  getNetWorth,
  getWalletAge,
} from "../lib/moralis";
import { generateSecurityAudit, deriveRiskScore } from "../lib/groq";
import { saveMemoryAnalysis, getMemoryAnalysis } from "../lib/store";
import { formatUSD, shortenAddress, getRiskLevel, isValidEVMAddress } from "../lib/utils";
import { isEVMAddress, WELCOME_MESSAGE } from "../lib/telegram";

async function runTests() {
  console.log("🚀 Starting TreasuryWizard Integration Tests...\n");

  const testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik's address

  // 1. Address Validation
  console.log("1️⃣ Testing Address Validation...");
  if (!isValidEVMAddress(testAddress) || !isEVMAddress(testAddress)) {
    throw new Error("Address validation failed for valid EVM address.");
  }
  if (isValidEVMAddress("not-an-address") || isEVMAddress("0x123")) {
    throw new Error("Address validation accepted invalid address.");
  }
  console.log("   ✅ Address validation passed.");

  // 2. Blockchain / Demo Data Pipeline
  console.log("\n2️⃣ Testing Blockchain Data Fetching...");
  const [approvals, tokens, txs, netWorth, walletAge] = await Promise.all([
    getTokenApprovals(testAddress, "eth"),
    getTokenBalances(testAddress, "eth"),
    getTransactions(testAddress, "eth"),
    getNetWorth(testAddress, "eth"),
    getWalletAge(testAddress, "eth"),
  ]);

  console.log(`   - Approvals found: ${approvals.length}`);
  console.log(`   - Tokens found: ${tokens.length}`);
  console.log(`   - Transactions found: ${txs.length}`);
  console.log(`   - Net worth: ${formatUSD(netWorth)}`);
  console.log(`   - Wallet age: ${walletAge} days`);

  if (!Array.isArray(approvals) || !Array.isArray(tokens) || !Array.isArray(txs)) {
    throw new Error("Blockchain data fetch did not return expected array structures.");
  }
  console.log("   ✅ Data layer passed.");

  // 3. AI Security Audit Synthesis (with fallback engine)
  console.log("\n3️⃣ Testing Security Audit Engine...");
  const { report, risk_score } = await generateSecurityAudit({
    wallet_address: testAddress,
    chain: "eth",
    approvals,
    recent_transactions: txs,
    net_worth: netWorth,
    wallet_age_days: walletAge,
    token_count: tokens.length,
  });

  console.log(`   - Generated Risk Score: ${risk_score}/100`);
  console.log(`   - Report length: ${report.length} chars`);
  console.log(`   - Header snippet:\n     ${report.split("\n").slice(0, 4).join("\n     ")}`);

  if (risk_score < 1 || risk_score > 100) {
    throw new Error(`Risk score out of bounds: ${risk_score}`);
  }
  if (!report.includes("TreasuryWizard Audit Report") && !report.includes("Risk Score")) {
    throw new Error("Report does not contain standard audit format.");
  }
  console.log("   ✅ Security audit engine passed.");

  // 4. Persistence & Slug Retrieval Cache
  console.log("\n4️⃣ Testing Memory Cache & Persistence Fallback...");
  const testSlug = "test_slug_" + Date.now();
  saveMemoryAnalysis({
    id: testSlug,
    slug: testSlug,
    wallet_address: testAddress,
    chain: "eth",
    token_data: tokens,
    nft_data: [],
    transaction_data: txs,
    approval_data: approvals,
    net_worth: netWorth,
    ai_report: report,
    risk_score,
    wallet_age_days: walletAge,
    is_whale: false,
    unlimited_approval_count: approvals.filter((a) => a.is_unlimited).length,
    created_at: new Date().toISOString(),
  });

  const retrieved = getMemoryAnalysis(testSlug);
  if (!retrieved || retrieved.wallet_address !== testAddress) {
    throw new Error("Memory analysis retrieval failed.");
  }
  console.log(`   - Successfully stored and retrieved slug: ${testSlug}`);
  console.log("   ✅ Persistence & fallback cache passed.");

  // 5. Utility & Formatting Robustness
  console.log("\n5️⃣ Testing Utility & Formatting Robustness...");
  if (formatUSD("1234.56") !== "$1.23K") {
    throw new Error(`formatUSD string handling failed: got ${formatUSD("1234.56")}`);
  }
  if (formatUSD("42.50") !== "$42.50") {
    throw new Error(`formatUSD decimal string failed: got ${formatUSD("42.50")}`);
  }
  if (formatUSD(null) !== "$0.00" || formatUSD(NaN) !== "$0.00") {
    throw new Error("formatUSD null/NaN handling failed.");
  }
  if (shortenAddress(testAddress) !== "0xd8dA...6045") {
    throw new Error(`shortenAddress failed: got ${shortenAddress(testAddress)}`);
  }
  const risk = getRiskLevel(75);
  if (risk.label !== "High Risk") {
    throw new Error(`getRiskLevel failed: expected High Risk, got ${risk.label}`);
  }
  console.log("   ✅ Utility functions passed.");

  console.log("\n🎉 ALL TESTS PASSED! Project is verified fully functional.\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
