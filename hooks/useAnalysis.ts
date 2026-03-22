import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chain } from "@/types";
import { isValidEVMAddress } from "@/lib/utils";

export function useAnalysis() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("");

  const stages = [
    "Connecting to blockchain...",
    "Fetching token balances...",
    "Scanning NFT holdings...",
    "Analyzing transaction history...",
    "Running AI analysis...",
    "Generating intelligence report...",
  ];

  async function analyze(wallet_address: string, chain: Chain) {
    if (!isValidEVMAddress(wallet_address)) {
      setError("Please enter a valid EVM wallet address (0x...)");
      return;
    }

    setLoading(true);
    setError(null);

    let stageIndex = 0;
    setStage(stages[0]);
    const stageInterval = setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      setStage(stages[stageIndex]);
    }, 2500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address, chain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      clearInterval(stageInterval);
      router.push(`/report/${data.slug}`);
    } catch (err: any) {
      clearInterval(stageInterval);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
      setStage("");
    }
  }

  return { analyze, loading, error, stage };
}
