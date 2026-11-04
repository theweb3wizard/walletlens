"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Search,
  Bot,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";
import { Chain } from "@/types";
import { CHAINS } from "@/constants";

const FEATURES = [
  {
    icon: AlertTriangle,
    title: "Unlimited Approval Detection",
    desc: "Instantly surfaces any token approval set to max uint256 — the most common treasury drain vector.",
    color: "#F43F5E",
  },
  {
    icon: Shield,
    title: "Risky Contract Flagging",
    desc: "Flags spender contracts deployed less than 30 days ago or with no verified source code.",
    color: "#6366F1",
  },
  {
    icon: TrendingUp,
    title: "AI Risk Score (1–100)",
    desc: "Groq AI synthesizes all findings into a single risk score with plain-English justification.",
    color: "#10B981",
  },
  {
    icon: Bot,
    title: "Telegram-Native Delivery",
    desc: "No dashboards to log into. Reports arrive directly in your team's Telegram, formatted and ready to act on.",
    color: "#06B6D4",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Send your wallet address",
    desc: "DM @TreasuryWizardBot any EVM address — Gnosis Safe, hot wallet, or DAO treasury.",
  },
  {
    step: "02",
    title: "AI scans approvals & activity",
    desc: "We fetch token approvals, recent counterparties, and risk signals from the chain via Moralis.",
  },
  {
    step: "03",
    title: "Receive your Wallet Health Report",
    desc: "Groq AI returns a plain-English audit in ~15 seconds with a risk score and fix recommendations.",
  },
  {
    step: "04",
    title: "Automate with a custom agent",
    desc: "Reply AGENT to unlock 24/7 automated monitoring tailored to your project's treasury.",
  },
];

const SAMPLE_WALLETS = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
];

export default function HomePage() {
  const [address, setAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState<Chain>("eth");
  const { analyze, loading, error, stage } = useAnalysis();
  const [totalAudits, setTotalAudits] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"telegram" | "web">("web");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (d.count) setTotalAudits(d.count); })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    analyze(address.trim(), selectedChain);
  }

  const STATS = [
    { label: "Wallets Audited", value: totalAudits > 0 ? totalAudits.toLocaleString() : "1,200+" },
    { label: "Chains Supported", value: "5" },
    { label: "Avg. Audit Time", value: "~15s" },
    { label: "Cost", value: "Free" },
  ];

  return (
    <main className="min-h-screen bg-void noise overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-glow-indigo opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-glow-cyan opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" style={{ backgroundSize: "40px 40px" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center shadow-glow-sm">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-display font-700 text-lg tracking-tight text-white">
            Treasury<span className="text-gradient-indigo">Wizard</span>
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-muted font-mono">Web3 Treasury Audit</span>
          <a
            href="https://t.me/TreasuryWizardBot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo hover:bg-indigo-dim text-white text-xs font-display font-600 transition-all shadow-glow-sm"
          >
            <Bot size={12} />
            Open Bot
          </a>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-20 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo/30 bg-indigo/10 text-indigo-glow text-sm font-mono mb-8">
            <Zap size={12} />
            AI-powered · Read-only · Built for Web3 founders & DAO treasurers
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-800 leading-none tracking-tight text-white mb-6 max-w-4xl">
            Audit Your{" "}
            <span className="text-gradient-indigo">Web3 Treasury</span>
            <br />
            in 15 Seconds
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
            Paste any EVM wallet address. Get an instant AI security report — unlimited approvals,
            risky contracts, risk score, and actionable fixes. Free. No wallet connection.
          </p>

          <p className="text-sm text-muted font-mono mb-10">
            Built for Gnosis Safe · DAO Treasuries · Project Multi-sigs
          </p>
        </motion.div>

        {/* CTA Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          {/* Tab switcher */}
          <div className="flex gap-2 mb-4 p-1 rounded-xl bg-surface border border-border w-fit mx-auto">
            <button
              onClick={() => setActiveTab("telegram")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-600 transition-all",
                activeTab === "telegram"
                  ? "bg-indigo text-white shadow-glow-sm"
                  : "text-muted hover:text-white"
              )}
            >
              <Bot size={14} />
              Telegram Bot
            </button>
            <button
              onClick={() => setActiveTab("web")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-600 transition-all",
                activeTab === "web"
                  ? "bg-indigo text-white shadow-glow-sm"
                  : "text-muted hover:text-white"
              )}
            >
              <Search size={14} />
              Web Audit
            </button>
          </div>

          {/* Telegram CTA */}
          {activeTab === "telegram" && (
            <motion.div
              key="telegram"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-8 border-glow text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo/20 border border-indigo/30 flex items-center justify-center mx-auto mb-4">
                <Bot size={28} className="text-indigo-glow" />
              </div>
              <h2 className="font-display font-700 text-white text-xl mb-2">
                @TreasuryWizardBot
              </h2>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Start a chat with the bot on Telegram. Send any EVM address.<br />
                Get your Wallet Health Report in seconds.
              </p>
              <a
                href="https://t.me/TreasuryWizardBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo hover:bg-indigo-dim text-white rounded-xl font-display font-600 text-sm transition-all shadow-glow-indigo hover:shadow-glow-indigo"
              >
                <Bot size={16} />
                Start Audit on Telegram
                <ChevronRight size={16} />
              </a>
              <p className="text-muted text-xs font-mono mt-4">
                Free · No account · Results in ~15 seconds
              </p>
            </motion.div>
          )}

          {/* Web audit input */}
          {activeTab === "web" && (
            <motion.div
              key="web"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-6 border-glow"
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Chain Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CHAINS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedChain(c.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-mono font-600 transition-all flex items-center gap-1.5 border shrink-0",
                        selectedChain === c.id
                          ? "bg-indigo text-white border-indigo shadow-glow-sm"
                          : "bg-surface border-border text-muted hover:text-white"
                      )}
                    >
                      <span className="text-sm leading-none">{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x... paste any EVM wallet address"
                    className="w-full bg-void border border-border rounded-xl pl-10 pr-4 py-4 text-sm font-mono text-slate-200 placeholder:text-muted focus:outline-none focus:border-indigo/60 focus:shadow-glow-sm transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !address}
                  className={cn(
                    "w-full py-4 rounded-xl font-display font-600 text-sm tracking-wide transition-all flex items-center justify-center gap-2",
                    loading || !address
                      ? "bg-subtle text-muted cursor-not-allowed"
                      : "bg-indigo hover:bg-indigo-dim text-white shadow-glow-indigo"
                  )}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {stage}
                    </>
                  ) : (
                    <>
                      Run Security Audit
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-3 px-4 py-3 rounded-lg bg-rose/10 border border-rose/30 text-rose text-sm font-mono">
                  {error}
                </div>
              )}

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
            </motion.div>
          )}
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-muted font-mono"
        >
          {[
            "🔒 Read-only · Never requests private keys",
            "⚡ Results in ~15 seconds",
            "🌐 Ethereum · Polygon · BNB · Arbitrum · Base",
          ].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center border border-border">
              <div className="font-display text-2xl font-700 text-white mb-1">{stat.value}</div>
              <div className="text-xs text-muted font-mono">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-4">
            How It <span className="text-gradient-indigo">Works</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            A four-step audit from wallet address to actionable security report.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 border border-border"
            >
              <div className="font-display font-800 text-3xl text-indigo/30 mb-3">{step.step}</div>
              <h3 className="font-display font-600 text-white text-sm mb-2">{step.title}</h3>
              <p className="text-muted text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-4">
            What We <span className="text-gradient-cyan">Check</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            The four risk vectors that every Web3 founder needs to monitor — and most don&apos;t.
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
              className="glass rounded-2xl p-6 border border-border hover:border-subtle transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ backgroundColor: `${f.color}20`, border: `1px solid ${f.color}40` }}
              >
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-600 text-white text-base mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl border-glow p-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo/20 border border-indigo/30 flex items-center justify-center mx-auto mb-6">
            <Lock size={24} className="text-indigo-glow" />
          </div>
          <h2 className="font-display text-3xl font-700 text-white mb-4">
            Is your treasury safe?
          </h2>
          <p className="text-muted mb-8 leading-relaxed max-w-lg mx-auto">
            Most Web3 projects have at least one unlimited token approval they&apos;ve forgotten about.
            Find yours before an attacker does.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://t.me/TreasuryWizardBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo hover:bg-indigo-dim text-white rounded-xl font-display font-600 text-sm transition-all shadow-glow-indigo"
            >
              <Bot size={16} />
              Audit on Telegram — Free
            </a>
            <button
              onClick={() => { setActiveTab("web"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border hover:border-subtle text-muted hover:text-white rounded-xl font-display font-600 text-sm transition-all"
            >
              <Search size={16} />
              Use Web Dashboard
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="font-display font-600 text-sm text-white">TreasuryWizard</span>
          </div>
          <p className="text-xs text-muted font-mono text-center">
            Read-only · No wallet connection · Data via Moralis · AI via Groq · Built by The Web3 Wizard
          </p>
          <div className="flex items-center gap-4 text-xs text-muted font-mono">
            <a href="https://t.me/TreasuryWizardBot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Telegram Bot
            </a>
            <CheckCircle size={12} className="text-emerald" />
            <span className="text-emerald">Live</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
