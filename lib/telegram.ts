/**
 * Telegram Bot helpers — send messages, notify operator.
 * Uses the Bot API via plain fetch (no node-telegram-bot-api needed server-side).
 */

export const BOT_NAME = "TreasuryWizard";

const CALENDLY_URL =
  process.env.CALENDLY_URL || "https://calendly.com/theweb3wizard/15min";

// ── Core sender ──────────────────────────────────────────────────
export async function sendMessage(
  chatId: number | string,
  text: string,
  parseMode: "Markdown" | "HTML" | undefined = "Markdown"
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your_telegram_bot_token_here") {
    console.warn(`[Telegram Mock] Message to ${chatId}: ${text.slice(0, 100)}...`);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Telegram API error (${res.status}):`, errBody);
    }
  } catch (err) {
    console.error("Telegram sendMessage network error:", err);
  }
}

// ── Welcome message ──────────────────────────────────────────────
export const WELCOME_MESSAGE = `🧙‍♂️ *Welcome to TreasuryWizard* — your AI-powered Web3 security auditor.

I audit EVM project wallets for:
🔍 Unlimited token approvals
⚠️ Interactions with risky or unverified contracts
📊 A plain-English Risk Score (1–100)
💡 Actionable steps to fix what's broken

→ *Send me any EVM wallet address to get started.*
   Example: \`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\`

🔒 Read-only. I never ask for private keys.
📈 Built for Web3 founders, DAO treasurers & multi-sig signers.`;

// ── AGENT reply (hot lead) ───────────────────────────────────────
export async function handleAgentIntent(
  chatId: number,
  username: string | undefined,
  lastWallet?: string
): Promise<void> {
  // 1. Reply to user with Calendly link
  await sendMessage(
    chatId,
    `🧙‍♂️ *Great choice!*

Book your free 15-min strategy call here:
👉 ${CALENDLY_URL}

I'll help you design a *custom AI Treasury Agent* for your project — automated alerts, daily audits, and real-time risk monitoring.

Talk soon! 🚀`
  );

  // 2. Notify operator if configured
  const operatorChatId = process.env.TELEGRAM_OPERATOR_CHAT_ID;
  if (operatorChatId && operatorChatId !== "your_numeric_chat_id_here") {
    const userLabel = username ? `@${username}` : `ID: ${chatId}`;
    const walletInfo = lastWallet ? `\n📋 Last scanned: \`${lastWallet}\`` : "";

    await sendMessage(
      operatorChatId,
      `🔔 *New AGENT Lead!*

👤 ${userLabel} (chat ID: ${chatId})
🕐 ${new Date().toUTCString()}${walletInfo}

They replied *AGENT* after an audit — follow up!`
    );
  }
}

// ── Register webhook with Telegram ──────────────────────────────
export async function registerWebhook(webhookUrl: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your_telegram_bot_token_here") {
    console.error("TELEGRAM_BOT_TOKEN is not configured.");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ["message"],
      }),
    });
    const data = (await res.json()) as { ok: boolean };
    return !!data.ok;
  } catch (err) {
    console.error("registerWebhook error:", err);
    return false;
  }
}

// ── EVM address validator ────────────────────────────────────────
export function isEVMAddress(text: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(text.trim());
}
