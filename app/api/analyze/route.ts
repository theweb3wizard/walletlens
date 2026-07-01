import { NextRequest, NextResponse } from "next/server";
import { getTokenBalances, getNFTs, getTransactions, getNetWorth, getWalletAge, isWhale } from "@/lib/moralis";
import { generateWalletReport } from "@/lib/groq";
import { isValidEVMAddress, generateSlug, getHashedIP } from "@/lib/utils";
import { FREE_ANALYSES_PER_DAY } from "@/constants";
import { supabaseAdmin } from "@/lib/supabase";

async function incrementUsage(ipHash: string, date: string) {
  const { data: existing } = await supabaseAdmin
    .from("usage_limits")
    .select("count")
    .eq("ip_hash", ipHash)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("usage_limits")
      .update({ count: existing.count + 1 })
      .eq("ip_hash", ipHash)
      .eq("date", date);
  } else {
    await supabaseAdmin
      .from("usage_limits")
      .insert({ ip_hash: ipHash, date, count: 1 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, chain = "eth" } = body;

    if (!wallet_address || !isValidEVMAddress(wallet_address)) {
      return NextResponse.json({ error: "Invalid EVM wallet address." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") || "unknown";
    const ipHash = getHashedIP(ip);
    const today = new Date().toISOString().split("T")[0];

    const { data: usageRow } = await supabaseAdmin
      .from("usage_limits")
      .select("count")
      .eq("ip_hash", ipHash)
      .eq("date", today)
      .maybeSingle();

    const currentCount = usageRow?.count || 0;
    if (currentCount >= FREE_ANALYSES_PER_DAY) {
      return NextResponse.json({
        error: `Daily limit reached. You've used all ${FREE_ANALYSES_PER_DAY} free analyses for today. Come back tomorrow!`
      }, { status: 429 });
    }

    const { data: cached } = await supabaseAdmin
      .from("analyses")
      .select("slug, created_at")
      .eq("wallet_address", wallet_address.toLowerCase())
      .eq("chain", chain)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      await incrementUsage(ipHash, today);
      return NextResponse.json({ slug: cached.slug, cached: true });
    }

    const [tokens, nfts, transactions, netWorth, walletAgeDays] = await Promise.all([
      getTokenBalances(wallet_address, chain),
      getNFTs(wallet_address, chain),
      getTransactions(wallet_address, chain),
      getNetWorth(wallet_address, chain),
      getWalletAge(wallet_address, chain),
    ]);
    const whale = isWhale(netWorth);
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

    const slug = generateSlug();
    const analysis = {
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
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabaseAdmin
      .from("analyses")
      .insert(analysis);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
    }

    await incrementUsage(ipHash, today);

    return NextResponse.json({ slug, cached: false });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
