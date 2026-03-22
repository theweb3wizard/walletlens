import { NextRequest, NextResponse } from "next/server";
import {
  getTokenBalances,
  getNFTs,
  getTransactions,
  getNetWorth,
  getWalletAge,
  isWhale,
} from "@/lib/moralis";
import { generateWalletReport } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
import { isValidEVMAddress, generateSlug, getHashedIP } from "@/lib/utils";
import { FREE_ANALYSES_PER_DAY } from "@/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, chain = "eth" } = body;

    // Validate address
    if (!wallet_address || !isValidEVMAddress(wallet_address)) {
      return NextResponse.json(
        { error: "Invalid EVM wallet address." },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = getHashedIP(ip);
    const today = new Date().toISOString().split("T")[0];

    // Check current usage
    const { data: usageData } = await supabaseAdmin
      .from("usage_limits")
      .select("id, count")
      .eq("ip_hash", ipHash)
      .eq("date", today)
      .maybeSingle();

    const currentCount = usageData?.count || 0;

    if (currentCount >= FREE_ANALYSES_PER_DAY) {
      return NextResponse.json(
        {
          error: `Daily limit reached. You've used all ${FREE_ANALYSES_PER_DAY} free analyses for today. Come back tomorrow!`,
        },
        { status: 429 }
      );
    }

    // Check cache — return existing analysis if less than 1 hour old
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabaseAdmin
      .from("analyses")
      .select("slug")
      .eq("wallet_address", wallet_address.toLowerCase())
      .eq("chain", chain)
      .gte("created_at", oneHourAgo)
      .maybeSingle();

    if (cached) {
      // Still increment usage even for cached results
      await incrementUsage(ipHash, today, usageData?.id, currentCount);
      return NextResponse.json({ slug: cached.slug, cached: true });
    }

    // Fetch all wallet data in parallel
    const [tokens, nfts, transactions, netWorth, walletAgeDays] =
      await Promise.all([
        getTokenBalances(wallet_address, chain),
        getNFTs(wallet_address, chain),
        getTransactions(wallet_address, chain),
        getNetWorth(wallet_address, chain),
        getWalletAge(wallet_address, chain),
      ]);

    const whale = isWhale(netWorth);

    // Generate AI report
    const { report, risk_score } = await generateWalletReport({
      wallet_address,
      chain,
      net_worth: netWorth,
      token_count: tokens.length,
      nft_count: nfts.length,
      transaction_count: transactions.length,
      wallet_age_days: walletAgeDays,
      is_whale: whale,
      top_tokens: tokens.slice(0, 10),
      recent_transactions: transactions.slice(0, 10),
      nfts: nfts.slice(0, 10),
    });

    // Save to database
    const slug = generateSlug();
    const { error: insertError } = await supabaseAdmin
      .from("analyses")
      .insert({
        slug,
        wallet_address: wallet_address.toLowerCase(),
        chain,
        token_data: tokens,
        nft_data: nfts,
        transaction_data: transactions,
        net_worth: netWorth,
        ai_report: report,
        risk_score,
        wallet_age_days: walletAgeDays,
        is_whale: whale,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save analysis." },
        { status: 500 }
      );
    }

    // Increment usage count
    await incrementUsage(ipHash, today, usageData?.id, currentCount);

    return NextResponse.json({ slug, cached: false });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

// Separate function to handle usage increment cleanly
async function incrementUsage(
  ipHash: string,
  date: string,
  existingId: string | undefined,
  currentCount: number
) {
  if (existingId) {
    // Update existing row
    await supabaseAdmin
      .from("usage_limits")
      .update({ count: currentCount + 1 })
      .eq("id", existingId);
  } else {
    // Insert new row
    await supabaseAdmin
      .from("usage_limits")
      .insert({ ip_hash: ipHash, date, count: 1 });
  }
}