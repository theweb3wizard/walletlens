"use client";

import { motion } from "framer-motion";
import { Search, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-glow-indigo opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-strong rounded-2xl p-10 border-glow text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo/20 border border-indigo/30 flex items-center justify-center mx-auto mb-6">
          <Search size={28} className="text-indigo-glow" />
        </div>

        <h1 className="font-display text-5xl font-800 text-white mb-2">
          404
        </h1>
        <p className="text-muted font-mono text-sm mb-2">
          Page not found
        </p>
        <p className="text-muted text-xs font-mono mb-8">
          This page doesn&apos;t exist or the analysis report was not found.
        </p>

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo hover:bg-indigo-dim text-white rounded-xl font-display font-600 text-sm transition-all shadow-glow-sm"
        >
          <Home size={14} />
          Back to Home
        </button>
      </motion.div>
    </main>
  );
}
