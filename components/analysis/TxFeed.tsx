// ============================================
// components/analysis/TxFeed.tsx
// ============================================
import { Transaction } from "@/types";
import { shortenAddress } from "@/lib/utils";
import { ArrowLeftRight, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
 
interface TxFeedProps {
  transactions: Transaction[];
  walletAddress: string;
  chain: string;
}
 
const EXPLORER_MAP: Record<string, string> = {
  eth: "https://etherscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  bsc: "https://bscscan.com/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  base: "https://basescan.org/tx/",
};
 
export function TxFeed({ transactions, walletAddress, chain }: TxFeedProps) {
  const explorer = EXPLORER_MAP[chain] || EXPLORER_MAP.eth;
 
  return (
    <div className="glass rounded-2xl border border-border p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <ArrowLeftRight size={16} className="text-amber" />
        <h2 className="font-display font-600 text-white text-sm">
          Recent Transactions
        </h2>
        <span className="ml-auto text-muted text-xs font-mono">
          {transactions.length} shown
        </span>
      </div>
 
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm font-mono">
          No transactions found
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx, i) => {
            const isOut =
              tx.from_address?.toLowerCase() === walletAddress.toLowerCase();
            const success = tx.receipt_status === "1";
            const date = tx.block_timestamp
              ? new Date(tx.block_timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—";
 
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-subtle transition-all duration-200"
              >
                {success ? (
                  <CheckCircle size={14} className="text-emerald shrink-0" />
                ) : (
                  <XCircle size={14} className="text-rose shrink-0" />
                )}
 
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-600 px-1.5 py-0.5 rounded ${
                        isOut
                          ? "bg-rose/10 text-rose border border-rose/20"
                          : "bg-emerald/10 text-emerald border border-emerald/20"
                      }`}
                    >
                      {isOut ? "OUT" : "IN"}
                    </span>
                    <span className="text-white text-xs font-mono truncate">
                      {shortenAddress(tx.hash, 6)}
                    </span>
                  </div>
                  <p className="text-muted text-[10px] font-mono mt-0.5">
                    {isOut
                      ? `To: ${shortenAddress(tx.to_address || "", 4)}`
                      : `From: ${shortenAddress(tx.from_address || "", 4)}`}{" "}
                    · {date}
                  </p>
                </div>
 
                <a
                  href={`${explorer}${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-indigo transition-colors shrink-0"
                >
                  <ExternalLink size={12} />
                </a>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
 
export default TxFeed;