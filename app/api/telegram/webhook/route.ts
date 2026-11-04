import { NextRequest, NextResponse } from "next/server";
import {
  sendMessage,
  handleAgentIntent,
  isEVMAddress,
  WELCOME_MESSAGE,
} from "@/lib/telegram";
import { upsertLead, markAgentIntent, logAudit, getLastWallet } from "@/lib/leads";
import { getTokenApprovals, getTransactions, getNetWorth, getWalletAge, getTokenBalances } from "@/lib/moralis";
import { generateSecurityAudit } from "@/lib/groq";

// ── Telegram update shape ────────────────────────────────────────
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      username?: string;
      first_name?: string;
    };
    chat: { id: number };
    text?: string;
  };
}

// ── Verify Telegram's secret token header ────────────────────────
function isValidRequest(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true; // skip check if not configured
  return req.headers.get("x-telegram-bot-api-secret-token") === secret;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isValidRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text || !message.from) {
    // Silently acknowledge non-message updates
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const from = message.from;
  const text = message.text.trim();

  // ── /start — welcome message ────────────────────────────────────
  if (text === "/start" || text === "/help") {
    await sendMessage(chatId, WELCOME_MESSAGE);
    return NextResponse.json({ ok: true });
  }

  // ── AGENT intent — hot lead ─────────────────────────────────────
  if (text.toUpperCase() === "AGENT") {
    try {
      await upsertLead({ telegram_id: from.id, username: from.username, first_name: from.first_name });
      await markAgentIntent(from.id);
      const lastWallet = await getLastWallet(from.id);
      await handleAgentIntent(chatId, from.username, lastWallet);
    } catch (err) {
      console.error("AGENT flow error:", err);
      await sendMessage(chatId, "🧙‍♂️ Something went wrong. Please try again shortly.");
    }
    return NextResponse.json({ ok: true });
  }

  // ── EVM Address — run audit ─────────────────────────────────────
  if (isEVMAddress(text)) {
    const walletAddress = text.trim();

    // Acknowledge immediately so user knows we're working
    await sendMessage(
      chatId,
      `🔍 Scanning \`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}\`\n\n⏳ Fetching approvals and running AI analysis... (10–20s)`
    );

    try {
      // Upsert lead record
      await upsertLead({ telegram_id: from.id, username: from.username, first_name: from.first_name });

      // Parallel data fetch
      const [approvals, transactions, netWorth, walletAgeDays, tokens] =
        await Promise.all([
          getTokenApprovals(walletAddress, "eth"),
          getTransactions(walletAddress, "eth"),
          getNetWorth(walletAddress, "eth"),
          getWalletAge(walletAddress, "eth"),
          getTokenBalances(walletAddress, "eth"),
        ]);

      // Edge case: empty wallet
      if (transactions.length === 0 && tokens.length === 0 && approvals.length === 0) {
        await sendMessage(
          chatId,
          `🧙‍♂️ *WalletLens Audit Report*\n\n🎯 *Wallet:* \`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}\`\n\n📊 *Risk Score:* 5/100 (New or empty wallet — no transaction history found)\n\n⚠️ *Key Findings:*\n- No transactions detected on Ethereum mainnet\n- No active token approvals\n- Wallet may be new, on a different chain, or unused\n\n💡 *Actionable Recommendations:*\n- Verify you entered the correct address\n- If this is a new multi-sig, ensure it has been funded and activated\n- Check other chains (Polygon, Base, BSC) if applicable\n\n🧙‍♂️ Want to automate this? The Web3 Wizard builds custom AI Treasury Agents that monitor your wallets 24/7 and alert your team instantly. Reply 'AGENT' to book a free 15-min chat.`
        );
        return NextResponse.json({ ok: true });
      }

      // Generate AI security audit
      const { report, risk_score } = await generateSecurityAudit({
        wallet_address: walletAddress,
        chain: "eth",
        approvals,
        recent_transactions: transactions,
        net_worth: netWorth,
        wallet_age_days: walletAgeDays,
        token_count: tokens.length,
      });

      // Send report to user
      await sendMessage(chatId, report);

      // Store in DB (non-blocking — don't let DB errors affect user)
      logAudit({
        telegram_id: from.id,
        wallet_address: walletAddress,
        chain: "eth",
        risk_score,
        report_text: report,
        approval_count: approvals.length,
        unlimited_count: approvals.filter((a) => a.is_unlimited).length,
        raw_approvals: approvals,
        raw_transactions: transactions,
      }).catch((err) => console.error("logAudit error:", err));

    } catch (err) {
      console.error("Audit error:", err);
      await sendMessage(
        chatId,
        "⚠️ Analysis failed. This can happen with very new wallets or during high network load. Please try again in a moment."
      );
    }

    return NextResponse.json({ ok: true });
  }

  // ── Unknown input ───────────────────────────────────────────────
  await sendMessage(
    chatId,
    `🧙‍♂️ I only understand EVM wallet addresses.\n\nSend me an address like:\n\`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\`\n\nOr type /start to see the welcome message.`
  );

  return NextResponse.json({ ok: true });
}

// GET handler for webhook registration verification
export async function GET() {
  return NextResponse.json({ status: "TreasuryWizard webhook active" });
}
