// lib/local_storage.ts
// Simple wrapper around browser localStorage (or IndexedDB for larger data)

import { TokenBalance, NFTItem, Transaction } from "@/types";

export type AnalysisData = {
  slug: string;
  wallet_address: string;
  chain: string;
  token_data: TokenBalance[];
  nft_data: NFTItem[];
  transaction_data: Transaction[];
  net_worth: number;
  ai_report: string;
  risk_score: number;
  wallet_age_days: number;
  is_whale: boolean;
  created_at: string;
};

const ANALYSES_KEY = "walletlens_analyses"; // JSON map slug -> AnalysisData
const USAGE_KEY = "walletlens_usage"; // JSON map date -> count

function getJSON(key: string) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
function setJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAllAnalyses(): Record<string, AnalysisData> {
  return getJSON(ANALYSES_KEY) || {};
}
export function getAnalysis(slug: string): AnalysisData | undefined {
  const all = getAllAnalyses();
  return all[slug];
}
export function saveAnalysis(data: AnalysisData) {
  const all = getAllAnalyses();
  all[data.slug] = data;
  setJSON(ANALYSES_KEY, all);
}
export function findRecentAnalysis(wallet_address: string, chain: string, maxAgeMs: number): AnalysisData | undefined {
  const all = Object.values(getAllAnalyses());
  const now = Date.now();
  return all.find((a) => {
    return (
      a.wallet_address.toLowerCase() === wallet_address.toLowerCase() &&
      a.chain === chain &&
      now - new Date(a.created_at).getTime() <= maxAgeMs
    );
  });
}
export function incrementUsage(date: string) {
  const usage: Record<string, number> = getJSON(USAGE_KEY) || {};
  usage[date] = (usage[date] || 0) + 1;
  setJSON(USAGE_KEY, usage);
}
export function getUsageCount(date: string): number {
  const usage: Record<string, number> = getJSON(USAGE_KEY) || {};
  return usage[date] || 0;
}
