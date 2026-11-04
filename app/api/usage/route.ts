import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Rate limiting is handled per-Telegram-user in the bot flow.
 * The web dashboard gets free audits per day via client-side localStorage.
 * This endpoint returns a status so existing web UI code continues cleanly.
 */
export async function GET() {
  return NextResponse.json({ used: 0, remaining: 5, limit: 5 });
}
