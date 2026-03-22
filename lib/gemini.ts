import Groq from "groq-sdk";
import { TokenBalance, Transaction, NFTItem } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface AnalysisInput {
  wallet_address: string;
  chain: string;
  net_worth: number;
  token_count: number;
  nft_count: number;
  transaction_count: number;
  wallet_age_days: number;
  is_whale: boolean;
  top_tokens: TokenBalance[];
  recent_transactions: Transaction[];
  nfts: NFTItem[];
}

export async function generateWalletReport(
  input: AnalysisInput
): Promise<{ report: string; risk_score: number }> {
  const prompt = `You are WalletLens AI, an expert blockchain analyst. Analyze this EVM wallet and provide a detailed intelligence report.

WALLET DATA:
- Address: ${input.wallet_address}
- Chain: ${input.chain.toUpperCase()}
- Net Worth: $${input.net_worth.toLocaleString()}
- Token Holdings: ${input.token_count} tokens
- NFT Holdings: ${input.nft_count} NFTs
- Recent Transactions: ${input.transaction_count}
- Wallet Age: ${input.wallet_age_days} days
- Whale Status: ${input.is_whale ? "YES - High Value Wallet" : "No"}

TOP TOKEN HOLDINGS:
${
  input.top_tokens
    .slice(0, 5)
    .map(
      (t) =>
        `- ${t.symbol}: $${(t.usd_value || 0).toLocaleString()} (${(t.portfolio_percentage || 0).toFixed(1)}% of portfolio)`
    )
    .join("\n") || "None"
}

NFT COLLECTIONS:
${
  input.nfts
    .slice(0, 5)
    .map((n) => `- ${n.name || n.symbol || "Unknown"} (${n.contract_type})`)
    .join("\n") || "None"
}

RECENT ACTIVITY:
${
  input.recent_transactions
    .slice(0, 5)
    .map(
      (tx) =>
        `- ${tx.receipt_status === "1" ? "SUCCESS" : "FAILED"} ${tx.hash.slice(0, 10)}... (${new Date(tx.block_timestamp).toLocaleDateString()})`
    )
    .join("\n") || "No recent transactions"
}

Provide your analysis in this EXACT format with these EXACT section headers:

## WALLET OVERVIEW
[2-3 sentences: what kind of wallet is this? Active trader, holder, DeFi user, NFT collector?]

## PORTFOLIO BREAKDOWN
[2-3 sentences analyzing the token distribution and concentration risk]

## BEHAVIORAL ANALYSIS
[2-3 sentences on transaction patterns, frequency, and what this wallet has been doing]

## KEY INSIGHTS
- [First notable finding with specific data]
- [Second notable finding with specific data]
- [Third notable finding with specific data]

## RISK ASSESSMENT
[2-3 sentences explaining the risk profile and why]

## RISK SCORE: [NUMBER]
[Write only a single integer between 0 and 100. 0 = extremely safe, 100 = extremely risky. No other text on this line.]

Be direct, specific, and insightful. Use exact numbers from the data. Do not be generic.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are WalletLens AI, an expert blockchain and crypto wallet analyst. You provide precise, data-driven wallet intelligence reports. Always follow the exact format requested.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const text = completion.choices[0]?.message?.content || "";

  const riskMatch = text.match(/## RISK SCORE:\s*(\d+)/);
  const riskScore = riskMatch
    ? Math.min(100, Math.max(0, parseInt(riskMatch[1])))
    : 50;

  const report = text.replace(/## RISK SCORE:[\s\S]*$/, "").trim();

  return { report, risk_score: riskScore };
}