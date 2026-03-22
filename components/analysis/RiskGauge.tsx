"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRiskLevel } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface Props {
  score: number;
}

export default function RiskGauge({ score }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const risk = getRiskLevel(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = score / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, score);
        setDisplayed(Math.round(current));
        if (current >= score) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (score / 100) * circumference;

  return (
    <div className="glass rounded-2xl border border-border p-6 flex flex-col items-center justify-center h-full">
      <div className="flex items-center gap-2 mb-6 self-start">
        <ShieldCheck size={16} className="text-indigo" />
        <h2 className="font-display font-600 text-white text-sm">
          Risk Score
        </h2>
      </div>

      <div className="relative w-40 h-40">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="80"
            cy="80"
            r="54"
            fill="none"
            stroke="#1C1C35"
            strokeWidth="12"
          />
          {/* Progress */}
          <motion.circle
            cx="80"
            cy="80"
            r="54"
            fill="none"
            stroke={risk.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDash }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            style={{ filter: `drop-shadow(0 0 8px ${risk.color}60)` }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-4xl font-800 leading-none"
            style={{ color: risk.color }}
          >
            {displayed}
          </span>
          <span className="text-muted text-xs font-mono mt-1">/100</span>
        </div>
      </div>

      <div
        className="mt-4 px-4 py-2 rounded-full text-sm font-mono font-600 border"
        style={{
          color: risk.color,
          backgroundColor: risk.bg,
          borderColor: `${risk.color}40`,
        }}
      >
        {risk.label}
      </div>

      {/* Scale */}
      <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-muted">
        <span className="text-emerald">Safe</span>
        <div className="flex-1 h-px bg-gradient-to-r from-emerald via-amber to-rose opacity-40" />
        <span className="text-rose">Risky</span>
      </div>
    </div>
  );
}