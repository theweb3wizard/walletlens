import { NextRequest, NextResponse } from "next/server";
import { getHashedIP } from "@/lib/utils";
import { FREE_ANALYSES_PER_DAY } from "@/constants";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = getHashedIP(ip);
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabaseAdmin
      .from("usage_limits")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("date", today)
      .maybeSingle();

    const used = data?.count || 0;
    const remaining = Math.max(0, FREE_ANALYSES_PER_DAY - used);

    return NextResponse.json({
      used,
      remaining,
      limit: FREE_ANALYSES_PER_DAY,
    });
  } catch {
    return NextResponse.json({
      used: 0,
      remaining: FREE_ANALYSES_PER_DAY,
      limit: FREE_ANALYSES_PER_DAY,
    });
  }
}
