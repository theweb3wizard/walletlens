"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { TokenApproval } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  approvals: TokenApproval[];
}

export default function ApprovalsPanel({ approvals }: Props) {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="glass rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald/20 border border-emerald/30 flex items-center justify-center">
            <CheckCircle size={14} className="text-emerald" />
          </div>
          <div>
            <h2 className="font-display font-600 text-white text-sm">Token Approvals</h2>
            <p className="text-muted text-[10px] font-mono">Active spender permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald/5 border border-emerald/20">
          <CheckCircle size={16} className="text-emerald shrink-0" />
          <p className="text-emerald text-sm font-mono">No active token approvals found — clean slate ✅</p>
        </div>
      </div>
    );
  }

  const unlimitedCount = approvals.filter((a) => a.is_unlimited).length;
  const newContractCount = approvals.filter((a) => a.is_new_contract).length;

  return (
    <div className="glass rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose/20 border border-rose/30 flex items-center justify-center">
            <ShieldAlert size={14} className="text-rose" />
          </div>
          <div>
            <h2 className="font-display font-600 text-white text-sm">Token Approvals</h2>
            <p className="text-muted text-[10px] font-mono">Active spender permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unlimitedCount > 0 && (
            <span className="px-2 py-1 rounded-full bg-rose/10 border border-rose/30 text-rose text-[10px] font-mono font-600">
              {unlimitedCount} unlimited
            </span>
          )}
          {newContractCount > 0 && (
            <span className="px-2 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-[10px] font-mono font-600">
              {newContractCount} new contracts
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {approvals.slice(0, 8).map((approval, i) => {
          const spenderDisplay =
            approval.spender_address && approval.spender_address.length >= 10
              ? `${approval.spender_address.slice(0, 8)}...${approval.spender_address.slice(-4)}`
              : approval.spender_address || "Unknown Spender";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border text-xs font-mono",
                approval.is_unlimited
                  ? "bg-rose/5 border-rose/20"
                  : approval.is_new_contract
                  ? "bg-amber/5 border-amber/20"
                  : "bg-void/40 border-border"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Risk icon */}
                {approval.is_unlimited ? (
                  <AlertTriangle size={12} className="text-rose shrink-0" />
                ) : approval.is_new_contract ? (
                  <Clock size={12} className="text-amber shrink-0" />
                ) : (
                  <CheckCircle size={12} className="text-emerald shrink-0" />
                )}

                <div className="min-w-0">
                  <span className="text-white font-600">{approval.token_symbol}</span>
                  <span className="text-muted ml-2">→ {spenderDisplay}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={cn(
                    "font-600",
                    approval.is_unlimited ? "text-rose" : "text-slate-300"
                  )}
                >
                  {approval.approved_amount_formatted}
                </span>
                {approval.spender_contract_age_days !== null && (
                  <span
                    className={cn(
                      "text-[10px]",
                      approval.is_new_contract ? "text-amber" : "text-muted"
                    )}
                  >
                    {approval.spender_contract_age_days}d old
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {approvals.length > 8 && (
        <p className="text-muted text-xs font-mono text-center mt-3">
          +{approvals.length - 8} more approvals · Use the Telegram bot for the full list
        </p>
      )}
    </div>
  );
}
