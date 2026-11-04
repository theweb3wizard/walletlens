import { WalletAnalysis } from "@/types";

// In-memory cache for development, testing, and fallback when DB is temporarily unreachable.
declare global {
  // eslint-disable-next-line no-var
  var __analyses_store: Map<string, WalletAnalysis> | undefined;
}

const store: Map<string, WalletAnalysis> =
  global.__analyses_store ?? new Map<string, WalletAnalysis>();

if (process.env.NODE_ENV !== "production") {
  global.__analyses_store = store;
}

export function saveMemoryAnalysis(analysis: WalletAnalysis): void {
  store.set(analysis.slug, analysis);
  // Keep last 150 items to bound memory usage
  if (store.size > 150) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export function getMemoryAnalysis(slug: string): WalletAnalysis | undefined {
  return store.get(slug);
}

export function findMemoryAnalysis(
  walletAddress: string,
  chain: string
): WalletAnalysis | undefined {
  const normalized = walletAddress.toLowerCase();
  for (const item of store.values()) {
    if (
      item.wallet_address.toLowerCase() === normalized &&
      item.chain === chain
    ) {
      // Only return if created within the last hour
      const ageMs = Date.now() - new Date(item.created_at).getTime();
      if (ageMs < 3600 * 1000) {
        return item;
      }
    }
  }
  return undefined;
}
