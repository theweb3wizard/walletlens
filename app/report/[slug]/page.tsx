"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Share2,
  AlertTriangle,
  Loader2,
  Twitter,
} from "lucide-react";
import { WalletAnalysis } from "@/types";
import { shortenAddress, getRiskLevel } from "@/lib/utils";
import { CHAINS, SITE_URL } from "@/constants";
import PortfolioCard from "@/components/analysis/PortfolioCard";
import TokenList from "@/components/analysis/TokenList";
import NFTGrid from "@/components/analysis/NFTGrid";
import TxFeed from "@/components/analysis/TxFeed";
import RiskGauge from "@/components/analysis/RiskGauge";
import AIReport from "@/components/analysis/AIReport";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [data, setData] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/report/${slug}`);
      if (!res.ok) throw new Error("Report not found.");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load report."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetchReport();
  }, [slug, fetchReport]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnTwitter() {
    if (!data) return;
    const reportUrl = `${SITE_URL}/report/${slug}`;
    const risk = getRiskLevel(data.risk_score);
    const tweet = `Just analyzed this EVM wallet with @WalletLens AI 🔍\n\n📊 Risk Score: ${data.risk_score}/100 — ${risk.label}\n💰 Net Worth tracked on ${CHAINS.find((c) => c.id === data.chain)?.name || "Ethereum"}\n\nCheck any wallet in seconds 👇\n${reportUrl}\n\n#Web3 #Crypto #DeFi #WalletLens`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, "_blank");
  }

  const chain = CHAINS.find((c) => c.id === data?.chain);
  const risk = data ? getRiskLevel(data.risk_score) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo/20 border border-indigo/30 flex items-center justify-center">
            <Loader2 size={20} className="text-indigo animate-spin" />
          </div>
          <p className="text-muted font-mono text-sm">
            Loading intelligence report...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8 border-glow text-center max-w-md"
        >
          <AlertTriangle size={32} className="text-rose mx-auto mb-4" />
          <h2 className="font-display text-xl font-600 text-white mb-2">
            Report Not Found
          </h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-indigo hover:bg-indigo-dim text-white rounded-xl font-display font-600 text-sm transition-all"
          >
            Analyze a Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-void noise">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-glow-indigo opacity-40" />
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid"
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      {/* Sticky Header */}
      <nav className="z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-border glass-strong sticky top-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-mono group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          New Analysis
        </button>

        <div className="flex items-center gap-2">
          {data.is_whale && (
            <div className="px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-mono font-600">
              🐋 Whale
            </div>
          )}
          {chain && (
            <div
              className="px-3 py-1 rounded-full text-xs font-mono font-600"
              style={{
                backgroundColor: `${chain.color}20`,
                border: `1px solid ${chain.color}40`,
                color: chain.color,
              }}
            >
              {chain.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Twitter/X Share */}
          <button
            onClick={shareOnTwitter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:border-[#1DA1F2]/40 hover:text-[#1DA1F2] text-muted transition-all text-xs font-mono"
          >
            <Twitter size={12} />
            <span className="hidden sm:block">Tweet</span>
          </button>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:border-indigo/40 text-muted hover:text-white transition-all text-xs font-mono"
          >
            {copied ? (
              <Check size={12} className="text-emerald" />
            ) : (
              <Share2 size={12} />
            )}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Wallet Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-muted text-xs font-mono mb-1">
                Wallet Address
              </p>
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-lg md:text-2xl text-white font-500">
                  {shortenAddress(data.wallet_address, 8)}
                </h1>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(data.wallet_address)
                  }
                  className="text-muted hover:text-white transition-colors"
                  title="Copy address"
                >
                  <Copy size={14} />
                </button>
                <a
                  href={`https://etherscan.io/address/${data.wallet_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-indigo transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-muted text-xs font-mono mt-1">
                {data.wallet_age_days > 0
                  ? `${data.wallet_age_days} days old`
                  : "New wallet"}{" "}
                ·{" "}
                {new Date(data.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {risk && (
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-xl border"
                style={{
                  backgroundColor: risk.bg,
                  borderColor: `${risk.color}40`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse-slow"
                  style={{ backgroundColor: risk.color }}
                />
                <div>
                  <p
                    className="font-display font-700 text-lg leading-none"
                    style={{ color: risk.color }}
                  >
                    {data.risk_score}/100
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: risk.color }}
                  >
                    {risk.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <PortfolioCard
              netWorth={data.net_worth}
              tokenCount={data.token_data?.length || 0}
              nftCount={data.nft_data?.length || 0}
              txCount={data.transaction_data?.length || 0}
              tokens={data.token_data || []}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <RiskGauge score={data.risk_score} />
          </motion.div>
        </div>

        {/* AI Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <AIReport report={data.ai_report} />
        </motion.div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <TokenList tokens={data.token_data || []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TxFeed
              transactions={data.transaction_data || []}
              walletAddress={data.wallet_address}
              chain={data.chain}
            />
          </motion.div>
        </div>

        {/* NFTs */}
        {data.nft_data && data.nft_data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <NFTGrid nfts={data.nft_data} />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass rounded-2xl border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="font-display font-600 text-white">
              Analyze another wallet?
            </p>
            <p className="text-muted text-sm">
              5 free analyses per day. No sign-up required.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={shareOnTwitter}
              className="px-5 py-3 border border-[#1DA1F2]/30 hover:border-[#1DA1F2]/60 text-[#1DA1F2] rounded-xl font-display font-600 text-sm transition-all flex items-center gap-2"
            >
              <Twitter size={14} />
              Share on X
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-indigo hover:bg-indigo-dim text-white rounded-xl font-display font-600 text-sm transition-all shadow-glow-indigo whitespace-nowrap"
            >
              New Analysis →
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}