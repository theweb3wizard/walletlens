/**
 * POST /api/telegram/register
 * Call this once after deploying to Vercel to register your webhook URL.
 *
 * Usage:
 *   curl -X POST https://your-domain.vercel.app/api/telegram/register
 */

import { NextResponse } from "next/server";
import { registerWebhook } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not set." },
      { status: 500 }
    );
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  const success = await registerWebhook(webhookUrl);

  if (success) {
    return NextResponse.json({
      ok: true,
      message: `Webhook registered at ${webhookUrl}`,
    });
  }

  return NextResponse.json(
    { error: "Failed to register webhook with Telegram. Check TELEGRAM_BOT_TOKEN." },
    { status: 500 }
  );
}
