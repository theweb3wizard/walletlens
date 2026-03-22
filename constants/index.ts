import { ChainConfig } from "@/types";

export const CHAINS: ChainConfig[] = [
  { id: "eth", name: "Ethereum", symbol: "ETH", color: "#627EEA", icon: "⟠" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "#8247E5", icon: "⬡" },
  { id: "bsc", name: "BNB Chain", symbol: "BNB", color: "#F3BA2F", icon: "◈" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", color: "#28A0F0", icon: "◎" },
  { id: "base", name: "Base", symbol: "ETH", color: "#0052FF", icon: "⬡" },
];

export const FREE_ANALYSES_PER_DAY = 5;

export const WHALE_THRESHOLD_USD = 1_000_000;

export const MORALIS_CHAIN_MAP: Record<string, string> = {
  eth: "0x1",
  polygon: "0x89",
  bsc: "0x38",
  arbitrum: "0xa4b1",
  base: "0x2105",
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";