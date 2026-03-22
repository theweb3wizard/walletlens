"use client";

import { TokenBalance } from "@/types";
import { formatUSD } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Wallet, ImageIcon, ArrowLeftRight, Coins } from "lucide-react";

interface Props {
  netWorth: number;
  tokenCount: number;
  nftCount: number;
  txCount: number;
  tokens: TokenBalance[];
}

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return 0;
}

export default function PortfolioCard({
  netWorth,
  tokenCount,
  nftCount,
  txCount,
  tokens,
}: Props) {
  const chartData = tokens
    .filter((t) => (t.usd_value || 0) > 0)
    .slice(0, 6)
    .map((t) => ({
      name: t.symbol,
      value: t.usd_value || 0,
    }));

  const stats = [
    { icon: Coins, label: "Tokens", value: tokenCount, color: "#6366F1" },
    { icon: ImageIcon, label: "NFTs", value: nftCount, color: "#06B6D4" },
    { icon: ArrowLeftRight, label: "Txns", value: txCount, color: "#10B981" },
  ];

  return (
    <div className="glass rounded-2xl border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Wallet size={16} className="text-indigo" />
        <h2 className="font-display font-600 text-white text-sm">
          Portfolio Overview
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="text-muted text-xs font-mono mb-1">Total Net Worth</p>
          <p className="font-display text-4xl font-700 text-white mb-1">
            {formatUSD(netWorth)}
          </p>
          <p className="text-muted text-xs font-mono">Across all assets</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border border-border bg-void/50 text-center"
              >
                <s.icon
                  size={14}
                  className="mx-auto mb-2"
                  style={{ color: s.color }}
                />
                <p className="font-display font-700 text-white text-lg">
                  {s.value}
                </p>
                <p className="text-muted text-[10px] font-mono">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="w-full md:w-48 h-48">
            <p className="text-muted text-xs font-mono mb-2 text-center">
              Distribution
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#11111F",
                    border: "1px solid #1C1C35",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono",
                  }}
                  formatter={(value) => [formatUSD(toNumber(value)), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}