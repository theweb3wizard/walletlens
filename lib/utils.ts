import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUSD(value: number): string {
  if (!isFinite(value) || isNaN(value)) return "$0.00";
  // Cap display at $999T — anything above is likely a meme token with fake price
  if (value > 999_000_000_000_000) return ">$999T";
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function generateSlug(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getRiskLevel(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score <= 30)
    return { label: "Low Risk", color: "#10B981", bg: "rgba(16,185,129,0.1)" };
  if (score <= 60)
    return {
      label: "Moderate Risk",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
    };
  if (score <= 80)
    return {
      label: "High Risk",
      color: "#F43F5E",
      bg: "rgba(244,63,94,0.1)",
    };
  return {
    label: "Critical Risk",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
  };
}

export function getHashedIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}