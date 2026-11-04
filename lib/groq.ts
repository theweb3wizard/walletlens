import Groq from "groq-sdk";
import { AuditInput, TokenApproval } from "@/types";

let _groq: Groq | null = null;

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return null;
  }
  if (!_groq) {
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

const CTA =
  "🧙‍♂️ Want to automate this? The Web3 Wizard builds custom AI Treasury Agents that monitor your wallets 24/7 and alert your team instantly. Reply 'AGENT' to book a free 15-min chat.";

function buildApprovalSummary(approvals: TokenApproval[]): string {
  if (approvals.length === 0)
    return "No active token approvals found on this wallet.";

  return approvals
    .slice(0, 5)
    .map((a) => {
      const risk = a.is_unlimited
        ? "⛔ UNLIMITED"
        : a.is_new_contract
        ? "⚠️ NEW CONTRACT"
        : "✅ BOUNDED";
      const age =
        a.spender_contract_age_days !== null
          ? `${a.spender_contract_age_days}d old spender`
          : "unknown age";
      return `- ${a.token_symbol} → ${a.spender_address.slice(0, 10)}... | Amount: ${a.approved_amount_formatted} | ${risk} | ${age}`;
    })
    .join("\n");
}

function buildTxSummary(
  transactions: AuditInput["recent_transactions"]
): string {
  if (transactions.length === 0) return "No recent transactions found.";
  return transactions
    .slice(0, 10)
    .map(
      (tx) =>
        `- ${tx.receipt_status === "1" ? "✅" : "❌"} ${tx.hash.slice(0, 10)}... → ${tx.to_address.slice(0, 10)}... (${new Date(tx.block_timestamp).toLocaleDateString()})`
    )
    .join("\n");
}

// Fallback risk scorer if AI doesn't include the score field or if API is unreachable
export function deriveRiskScore(
  unlimited: number,
  newContracts: number,
  totalApprovals: number
): number {
  let score = 10; // base: healthy wallet
  score += unlimited * 25; // each unlimited approval is very high risk
  score += newContracts * 10; // new/unverified contracts add moderate risk
  score += Math.min(totalApprovals * 2, 20); // approval sprawl adds some risk
  return Math.min(score, 100);
}

// Deterministic rule-based audit generator used when Groq is unavailable
function generateFallbackAudit(input: AuditInput): {
  report: string;
  risk_score: number;
} {
  const unlimitedCount = input.approvals.filter((a) => a.is_unlimited).length;
  const newContractCount = input.approvals.filter((a) => a.is_new_contract).length;
  const riskScore = deriveRiskScore(
    unlimitedCount,
    newContractCount,
    input.approvals.length
  );

  const findings: string[] = [];
  if (unlimitedCount > 0) {
    findings.push(
      `Detected ${unlimitedCount} UNLIMITED token approval(s) set to max uint256 — potential treasury drain vulnerability.`
    );
  } else {
    findings.push("No unlimited token approvals detected — strong permission hygiene.");
  }

  if (newContractCount > 0) {
    findings.push(
      `Identified ${newContractCount} approval(s) to smart contracts deployed less than 30 days ago.`
    );
  }

  if (input.approvals.length > 8) {
    findings.push(
      `High approval sprawl: ${input.approvals.length} total active permissions granted to external spenders.`
    );
  } else if (input.approvals.length > 0) {
    findings.push(
      `Found ${input.approvals.length} active spender permissions on-chain.`
    );
  } else {
    findings.push("Zero active token approvals on this chain.");
  }

  if (input.wallet_age_days < 30 && input.wallet_age_days > 0) {
    findings.push(`Wallet is relatively new (${input.wallet_age_days} days on-chain).`);
  }

  const recommendations: string[] = [];
  if (unlimitedCount > 0) {
    recommendations.push(
      "Revoke or edit unlimited approvals immediately via your multisig interface or Revoke.cash."
    );
  }
  if (newContractCount > 0) {
    recommendations.push(
      "Audit contract verification status and security reviews for newly deployed spenders."
    );
  }
  recommendations.push(
    "Set bounded approval amounts instead of infinite permissions for recurring protocol interactions."
  );
  recommendations.push(
    "Enforce multi-sig execution (e.g. Safe) with a minimum 2/3 threshold for any treasury outbound txs."
  );

  const shortAddr =
    input.wallet_address.length >= 10
      ? `${input.wallet_address.slice(0, 6)}...${input.wallet_address.slice(-4)}`
      : input.wallet_address;

  const report = [
    `🧙‍♂️ **TreasuryWizard Audit Report**`,
    ``,
    `🎯 **Wallet:** \`${shortAddr}\``,
    ``,
    `📊 **Risk Score:** ${riskScore}/100 (${
      riskScore > 65
        ? "Critical exposure from unlimited token allowances or unverified spenders"
        : riskScore > 35
        ? "Moderate exposure from active approvals or recent contract interactions"
        : "Healthy security posture with minimal unmanaged exposure"
    })`,
    ``,
    `⚠️ **Key Findings:**`,
    ...findings.map((f) => `- ${f}`),
    ``,
    `💡 **Actionable Recommendations:**`,
    ...recommendations.slice(0, 3).map((r) => `- ${r}`),
    ``,
    CTA,
  ].join("\n");

  return { report, risk_score: riskScore };
}

export async function generateSecurityAudit(
  input: AuditInput
): Promise<{ report: string; risk_score: number }> {
  const unlimitedCount = input.approvals.filter((a) => a.is_unlimited).length;
  const newContractCount = input.approvals.filter(
    (a) => a.is_new_contract
  ).length;

  const client = getGroqClient();
  if (!client) {
    return generateFallbackAudit(input);
  }

  const prompt = `You are an expert Web3 Security Auditor and AI Agent. Your job is to analyze raw EVM wallet data and output a concise, plain-English "Wallet Health Report" for a Web3 project founder.

Rules:
1. Be direct, professional, and use emojis for readability.
2. Identify ANY unlimited token approvals (amount == "115792089237316195423570985008687907853269984665640564039457584007913129639935" or similar max uint256). Flag these as HIGH RISK.
3. If a spender contract is unverified or very new (< 30 days old), flag it as MODERATE/HIGH RISK.
4. Keep the total output under 250 words.
5. ALWAYS end the report with this exact call-to-action:
"${CTA}"

WALLET DATA:
- Address: ${input.wallet_address}
- Chain: ${input.chain.toUpperCase()}
- Net Worth: $${input.net_worth.toLocaleString()}
- Token Count: ${input.token_count}
- Wallet Age: ${input.wallet_age_days} days
- Total Active Approvals: ${input.approvals.length}
- Unlimited Approvals: ${unlimitedCount} ${unlimitedCount > 0 ? "🚨" : "✅"}
- New/Unverified Spender Contracts: ${newContractCount} ${newContractCount > 0 ? "⚠️" : "✅"}

TOP APPROVALS:
${buildApprovalSummary(input.approvals)}

RECENT TRANSACTIONS (last 10):
${buildTxSummary(input.recent_transactions)}

Output Format — follow this EXACTLY:

🧙‍♂️ **TreasuryWizard Audit Report**

🎯 **Wallet:** [First 6 and last 4 chars of address]

📊 **Risk Score:** [1-100]/100 (Brief 1-sentence justification)

⚠️ **Key Findings:**
- [Finding 1]
- [Finding 2]
- [Finding 3 if applicable]

💡 **Actionable Recommendations:**
- [Step 1 to fix]
- [Step 2 to fix]

${CTA}`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are TreasuryWizard AI — an expert Web3 security auditor specializing in treasury wallet risk analysis for DAO founders and project managers. Be concise, direct, and always follow the exact output format requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content || "";
    if (!text) {
      return generateFallbackAudit(input);
    }

    // Extract risk score from the formatted output
    const riskMatch = text.match(/\*\*Risk Score:\*\*\s*(\d+)\s*\/\s*100/i);
    const riskScore = riskMatch
      ? Math.min(100, Math.max(1, parseInt(riskMatch[1])))
      : deriveRiskScore(unlimitedCount, newContractCount, input.approvals.length);

    return { report: text, risk_score: riskScore };
  } catch (err) {
    console.warn("Groq AI API call failed, falling back to local audit engine:", err);
    return generateFallbackAudit(input);
  }
}
