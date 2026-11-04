/**
 * POST /api/analyze
 * Web dashboard audit endpoint (mirrors Telegram bot logic for the web UI).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTokenApprovals,
  getTokenBalances,
  getNFTs,
  getTransactions,
  getNetWorth,
  getWalletAge,
  isWhale,
} from "@/lib/moralis";
import { generateSecurityAudit } from "@/lib/groq";
import { isValidEVMAddress, generateSlug } from "@/lib/utils";
import { sql } from "@/lib/db";
import { saveMemoryAnalysis, findMemoryAnalysis } from "@/lib/store";
import { WalletAnalysis } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, chain = "eth" } = body as {
      wallet_address: string;
      chain?: string;
    };

    if (!wallet_address || !isValidEVMAddress(wallet_address)) {
      return NextResponse.json(
        { error: "Invalid EVM wallet address. Must start with 0x and be 42 characters." },
        { status: 400 }
      );
    }

    const normalized = wallet_address.toLowerCase();

    // 1. Check database cache if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        const cached = await sql`
          SELECT slug, created_at
          FROM analyses
          WHERE wallet_address = ${normalized}
            AND chain = ${chain}
            AND created_at > NOW() - INTERVAL '1 hour'
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (cached.length > 0 && cached[0].slug) {
          return NextResponse.json({ slug: cached[0].slug, cached: true });
        }
      } catch (cacheErr) {
        console.warn("DB cache check skipped:", cacheErr);
      }
    } else {
      // Check in-memory store
      const memCached = findMemoryAnalysis(normalized, chain);
      if (memCached) {
        return NextResponse.json({ slug: memCached.slug, cached: true });
      }
    }

    // 2. Parallel data fetch from blockchain
    const [approvals, tokens, nfts, transactions, netWorth, walletAgeDays] =
      await Promise.all([
        getTokenApprovals(normalized, chain),
        getTokenBalances(normalized, chain),
        getNFTs(normalized, chain),
        getTransactions(normalized, chain),
        getNetWorth(normalized, chain),
        getWalletAge(normalized, chain),
      ]);

    const whale = isWhale(netWorth);

    // 3. AI Security Audit synthesis
    const { report, risk_score } = await generateSecurityAudit({
      wallet_address: normalized,
      chain,
      approvals,
      recent_transactions: transactions,
      net_worth: netWorth,
      wallet_age_days: walletAgeDays,
      token_count: tokens.length,
    });

    const slug = generateSlug();
    const unlimitedCount = approvals.filter((a) => a.is_unlimited).length;

    const analysisRecord: WalletAnalysis = {
      id: slug,
      slug,
      wallet_address: normalized,
      chain,
      token_data: tokens,
      nft_data: nfts,
      transaction_data: transactions,
      approval_data: approvals,
      net_worth: netWorth,
      ai_report: report,
      risk_score,
      wallet_age_days: walletAgeDays,
      is_whale: whale,
      unlimited_approval_count: unlimitedCount,
      created_at: new Date().toISOString(),
    };

    // 4. Save to in-memory fallback store
    saveMemoryAnalysis(analysisRecord);

    // 5. Persist to Neon DB if configured
    if (process.env.DATABASE_URL) {
      try {
        // Store in audit_logs
        await sql`
          INSERT INTO audit_logs (
            telegram_id, wallet_address, chain, risk_score,
            report_text, approval_count, unlimited_count,
            raw_approvals, raw_transactions
          ) VALUES (
            NULL,
            ${normalized},
            ${chain},
            ${risk_score},
            ${report},
            ${approvals.length},
            ${unlimitedCount},
            ${JSON.stringify(approvals)}::jsonb,
            ${JSON.stringify(transactions)}::jsonb
          )
        `;

        // Store in analyses table for slug-based sharing
        await sql`
          INSERT INTO analyses (
            slug, wallet_address, chain,
            token_data, nft_data, transaction_data, approval_data,
            net_worth, ai_report, risk_score,
            wallet_age_days, is_whale, unlimited_approval_count
          ) VALUES (
            ${slug}, ${normalized}, ${chain},
            ${JSON.stringify(tokens)}::jsonb, ${JSON.stringify(nfts)}::jsonb,
            ${JSON.stringify(transactions)}::jsonb, ${JSON.stringify(approvals)}::jsonb,
            ${netWorth}, ${report}, ${risk_score},
            ${walletAgeDays}, ${whale},
            ${unlimitedCount}
          )
        `;
      } catch (dbErr) {
        console.error("Database persistence error (in-memory copy retained):", dbErr);
      }
    }

    return NextResponse.json({ slug, cached: false });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please check the address and try again." },
      { status: 500 }
    );
  }
}
