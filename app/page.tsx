"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  ChevronRight,
  Globe,
} from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { CHAINS } from "@/constants";
import { Chain } from "@/types";
import { cn } from "@/lib/utils";

const SAMPLE_WALLETS = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Intelligence",
    desc: "Groq AI reads your wallet's entire history and generates a plain-English report in seconds.",
    color: "#6366F1",
  },
  {
    icon: Shield,
    title: "Risk Scoring",
    desc: "Every wallet gets a 0–100 risk score based on behavior patterns, token exposure, and activity.",
    color: "#06B6D4",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Breakdown",
    desc: "Token balances, USD values, NFT holdings, and portfolio concentration — all in one view.",
    color: "#10B981",
  },
  {
    icon: Globe,
    title: "Shareable Reports",
    desc: "Every analysis gets a unique URL. Share wallet intelligence with anyone instantly.",
    color: "#F59E0B",
  },
];

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<Chain>("eth");
  const { analyze, loading, error, stage } = useAnalysis();
  const [totalAnalyses, setTotalAnalyses] = useState<number>(0);
  const [usage, setUsage] = useState<{
    used: number;
    remaining: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.count) setTotalAnalyses(data.count);
      } catch {
        // silently fail
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        setUsage(data);
      } catch {
        // silently fail
      }
    }
    fetchUsage();
  }, []);

  // Refresh usage count after each analysis completes
  useEffect(() => {
    if (!loading && usage) {
      fetch("/api/usage")
        .then((r) => r.json())
        .then(setUsage)
        .catch(() => {});
    }
  }, [loading]);

  const stats = [
    {
      label: "Wallets Analyzed",
      value: totalAnalyses > 0 ? totalAnalyses.toLocaleString() : "—",
    },
    { label: "Chains Supported", value: "5" },
    {
      label: "AI Reports Generated",
      value: totalAnalyses > 0 ? totalAnalyses.toLocaleString() : "—",
    },
    { label: "Avg. Analysis Time", value: "~10s" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    analyze(address.trim(), chain);
  }

  const remainingDots = usage ? Array.from({ length: usage.limit }) : [];

  return (
    <main className="min-h-screen bg-void noise overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-glow-indigo opacity-60" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-glow-cyan opacity-40" />
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid opacity-100"
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center shadow-glow-sm">
            <Search size={16} className="text-white" />
          </div>
          <span className="font-display font-700 text-lg tracking-tight text-white">
            Wallet<span className="text-gradient-indigo">Lens</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <span className="hidden md:block text-sm text-muted font-mono">
            EVM Intelligence
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-xs text-emerald-DEFAULT font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-DEFAULT animate-pulse-slow" />
            Live
          </div>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo/30 bg-indigo/10 text-indigo-glow text-sm font-mono mb-8">
            <Zap size={12} />
            Powered by Groq AI + Moralis
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 leading-none tracking-tight text-white mb-6 max-w-4xl">
            Decode Any{" "}
            <span className="text-gradient-indigo">EVM Wallet</span>
            <br />
            In Seconds.
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste any wallet address. WalletLens fetches the on-chain data,
            runs AI analysis, and delivers a full intelligence report — risk
            score, portfolio breakdown, behavioral patterns and more.
          </p>
        </motion.div>

        {/* Main Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="glass-strong rounded-2xl p-6 border-glow shadow-card">
            {/* Chain selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChain(c.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-500 whitespace-nowrap transition-all duration-200 border",
                    chain === c.id
                      ? "text-white"
                      : "text-muted bg-surface border-border hover:border-subtle hover:text-slate-300"
                  )}
                  style={
                    chain === c.id
                      ? {
                          backgroundColor: `${c.color}20`,
                          borderColor: `${c.color}60`,
                          color: c.color,
                        }
                      : {}
                  }
                >
                  <span>{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Address input */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x... paste any EVM wallet address"
                  className="w-full bg-void border border-border rounded-xl pl-10 pr-4 py-4 text-sm font-mono text-slate-200 placeholder:text-muted focus:outline-none focus:border-indigo/60 focus:shadow-glow-sm transition-all duration-200"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !address || (usage?.remaining === 0)}
                className={cn(
                  "w-full py-4 rounded-xl font-display font-600 text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
                  loading || !address || usage?.remaining === 0
                    ? "bg-subtle text-muted cursor-not-allowed"
                    : "bg-indigo hover:bg-indigo-dim text-white shadow-glow-indigo hover:shadow-glow-indigo active:scale-[0.98]"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {stage}
                  </>
                ) : usage?.remaining === 0 ? (
                  "Daily limit reached — come back tomorrow"
                ) : (
                  <>
                    Analyze Wallet
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 px-4 py-3 rounded-lg bg-rose/10 border border-rose/30 text-rose text-sm font-mono"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Usage counter */}
            {usage !== null && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted font-mono">
                    Daily analyses:
                  </span>
                  <div className="flex items-center gap-1">
                    {remainingDots.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          i < usage.remaining
                            ? "bg-indigo shadow-glow-sm"
                            : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono font-600",
                      usage.remaining === 0
                        ? "text-rose"
                        : usage.remaining <= 2
                        ? "text-amber"
                        : "text-emerald"
                    )}
                  >
                    {usage.remaining}/{usage.limit} left
                  </span>
                </div>
              </div>
            )}

            {/* Sample wallets */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-mono">Try:</span>
              {SAMPLE_WALLETS.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setAddress(w)}
                  className="text-xs font-mono text-indigo-glow hover:text-white transition-colors px-2 py-1 rounded bg-indigo/10 hover:bg-indigo/20"
                  disabled={loading}
                >
                  {w.slice(0, 6)}...{w.slice(-4)}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-muted font-mono">
            5 free analyses per day · No wallet connection required · Read-only
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-3xl"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 text-center border border-border"
            >
              <div className="font-display text-2xl font-700 text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted font-mono">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-4">
            Everything you need to{" "}
            <span className="text-gradient-cyan">understand any wallet</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            No more switching between Etherscan, DeBank, and spreadsheets.
            WalletLens brings it all together with AI on top.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-border hover:border-subtle transition-all duration-300 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${f.color}20`,
                  border: `1px solid ${f.color}40`,
                }}
              >
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-600 text-white text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo flex items-center justify-center">
            <Search size={12} className="text-white" />
          </div>
          <span className="font-display font-600 text-sm text-white">
            WalletLens
          </span>
        </div>
        <p className="text-xs text-muted font-mono text-center">
          Read-only · No wallet connection · Data via Moralis · AI via Groq
        </p>
        <p className="text-xs text-muted font-mono">
          Built by{" "}
          <a
            href="https://twitter.com/theweb3wizard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-glow hover:text-white transition-colors"
          >
            The Web3 Wizard
          </a>
        </p>
      </footer>
    </main>
  );
}