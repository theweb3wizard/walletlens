"use client";

import { motion } from "framer-motion";
import { TokenBalance } from "@/types";
import { formatUSD } from "@/lib/utils";
import { Coins } from "lucide-react";
import Image from "next/image";

interface Props {
  tokens: TokenBalance[];
}

export default function TokenList({ tokens }: Props) {
  const sorted = [...tokens]
    .filter((t) => (t.usd_value || 0) > 0)
    .sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0))
    .slice(0, 10);

  return (
    <div className="glass rounded-2xl border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Coins size={16} className="text-cyan" />
        <h2 className="font-display font-600 text-white text-sm">
          Token Holdings
        </h2>
        <span className="ml-auto text-muted text-xs font-mono">
          {tokens.length} total
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm font-mono">
          No token balances found
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((token, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-subtle transition-all duration-200"
            >
              {token.logo ? (
                <Image
                  src={token.logo}
                  alt={token.symbol}
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center text-indigo text-xs font-mono font-600">
                  {token.symbol?.slice(0, 2)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-600 text-white text-sm">
                    {token.symbol}
                  </span>
                  <span className="font-mono text-white text-sm">
                    {formatUSD(token.usd_value || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-muted text-xs font-mono truncate">
                    {token.balance_formatted
                      ? parseFloat(token.balance_formatted).toFixed(4)
                      : "0"}{" "}
                    {token.symbol}
                  </span>
                  <span className="text-muted text-xs font-mono">
                    {(token.portfolio_percentage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(token.portfolio_percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}