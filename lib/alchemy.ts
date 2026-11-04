/**
 * Alchemy Blockchain Data Provider
 * Supports Ethereum, Polygon, BNB Chain, Arbitrum, Base, and Optimism
 * via Alchemy Enhanced RPC & NFT APIs.
 */

import { TokenBalance, NFTItem, Transaction, TokenApproval } from "@/types";
import { WHALE_THRESHOLD_USD } from "@/constants";

const ALCHEMY_CHAIN_HOSTS: Record<string, string> = {
  eth: "eth-mainnet",
  polygon: "polygon-mainnet",
  bsc: "bnb-mainnet",
  arbitrum: "arb-mainnet",
  base: "base-mainnet",
  optimism: "opt-mainnet",
};

// max uint256 — any approval matching or close to this is effectively unlimited
const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

// High-profile DeFi DEX & Bridge spenders commonly holding unlimited approvals
const NOTABLE_SPENDERS: Array<{ address: string; name: string; ageDays: number }> = [
  {
    address: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
    name: "Uniswap Universal Router",
    ageDays: 730,
  },
  {
    address: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    name: "Uniswap V3 SwapRouter02",
    ageDays: 950,
  },
  {
    address: "0xe592427a0aece92de3edee1f18e0157c05861564",
    name: "Uniswap V3 SwapRouter",
    ageDays: 1200,
  },
  {
    address: "0x111111125421ca6dc452d289314280a0f8842a65",
    name: "1inch v5 Router",
    ageDays: 800,
  },
  {
    address: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    name: "0x Exchange Proxy",
    ageDays: 1400,
  },
  {
    address: "0x000000000022d473030f116ddee9f6b43ac78ba3",
    name: "Uniswap Permit2",
    ageDays: 600,
  },
  {
    address: "0x0000000000000068f116a1041324729504783488",
    name: "OpenSea Seaport 1.6",
    ageDays: 320,
  },
  {
    address: "0x9008d19f58aabd9ed0d60971565aa8510560ab41",
    name: "CoW Protocol GPv2Settlement",
    ageDays: 980,
  },
  {
    address: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
    name: "Aave V3 Pool",
    ageDays: 850,
  },
];

// Common high-liquidity ERC-20 tokens on Ethereum mainnet
const CORE_TOKENS: Array<{ address: string; symbol: string; decimals: number }> = [
  { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", decimals: 6 },
  { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", decimals: 6 },
  { address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbol: "WETH", decimals: 18 },
  { address: "0x6b175474e89094c44da98b954eedeac495271d0f", symbol: "DAI", decimals: 18 },
  { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", symbol: "UNI", decimals: 18 },
  { address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", symbol: "WBTC", decimals: 8 },
];

function getApiKey(): string | null {
  const key = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!key || key.startsWith("your_")) return null;
  return key;
}

function getRpcUrl(chain: string): string | null {
  const key = getApiKey();
  if (!key) return null;
  const host = ALCHEMY_CHAIN_HOSTS[chain] || ALCHEMY_CHAIN_HOSTS.eth;
  return `https://${host}.g.alchemy.com/v2/${key}`;
}

async function rpcCall(chain: string, method: string, params: unknown[]): Promise<unknown> {
  const url = getRpcUrl(chain);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Alchemy RPC ${method} error (${res.status})`);
      return null;
    }

    const data = await res.json();
    return data.result ?? null;
  } catch (err) {
    console.error(`Alchemy RPC call failed: ${method}`, err);
    return null;
  }
}

// ── Token Balances ───────────────────────────────────────────────
export async function getAlchemyTokenBalances(
  address: string,
  chain: string
): Promise<TokenBalance[]> {
  try {
    const balances: TokenBalance[] = [];

    // 1. Fetch Native ETH Balance
    const nativeHex = (await rpcCall(chain, "eth_getBalance", [address, "latest"])) as string | null;
    if (nativeHex && nativeHex !== "0x0") {
      const wei = BigInt(nativeHex);
      const ethVal = Number(wei) / 1e18;
      const ethPrice = 3450; // Reference USD price for ETH
      balances.push({
        token_address: "0x0000000000000000000000000000000000000000",
        symbol: chain === "polygon" ? "POL" : chain === "bsc" ? "BNB" : "ETH",
        name: chain === "polygon" ? "Polygon" : chain === "bsc" ? "BNB" : "Ethereum",
        balance: wei.toString(),
        balance_formatted: ethVal.toFixed(4),
        usd_price: ethPrice,
        usd_value: Math.round(ethVal * ethPrice * 100) / 100,
        portfolio_percentage: 0,
      });
    }

    // 2. Fetch ERC-20 Tokens via Alchemy Enhanced API
    const rawData = (await rpcCall(chain, "alchemy_getTokenBalances", [
      address,
      "erc20",
    ])) as { tokenBalances?: Array<{ contractAddress: string; tokenBalance: string }> } | null;

    if (rawData?.tokenBalances) {
      const activeTokens = rawData.tokenBalances
        .filter((t) => t.tokenBalance && t.tokenBalance !== "0x" && t.tokenBalance !== "0x0")
        .slice(0, 15);

      // Fetch metadata in parallel
      const metaPromises = activeTokens.map(async (t) => {
        const meta = (await rpcCall(chain, "alchemy_getTokenMetadata", [
          t.contractAddress,
        ])) as {
          name?: string;
          symbol?: string;
          decimals?: number;
          logo?: string;
        } | null;

        const decimals = meta?.decimals ?? 18;
        const rawBig = BigInt(t.tokenBalance);
        const formatted = Number(rawBig) / Math.pow(10, decimals);

        const symbol = meta?.symbol || "UNKNOWN";
        let usdPrice = 0;
        if (["USDC", "USDT", "DAI"].includes(symbol)) usdPrice = 1.0;
        else if (symbol === "WETH") usdPrice = 3450;
        else if (symbol === "WBTC") usdPrice = 88000;
        else if (symbol === "UNI") usdPrice = 11.2;

        const usdValue = Math.round(formatted * usdPrice * 100) / 100;

        return {
          token_address: t.contractAddress,
          symbol,
          name: meta?.name || "ERC20 Token",
          logo: meta?.logo || undefined,
          balance: rawBig.toString(),
          balance_formatted: formatted >= 1000 ? formatted.toLocaleString("en-US", { maximumFractionDigits: 2 }) : formatted.toFixed(4),
          usd_price: usdPrice,
          usd_value: usdValue,
          portfolio_percentage: 0,
        };
      });

      const erc20s = await Promise.all(metaPromises);
      balances.push(...erc20s);
    }

    // Calculate portfolio percentages
    const totalUsd = balances.reduce((sum, b) => sum + (b.usd_value || 0), 0);
    if (totalUsd > 0) {
      for (const b of balances) {
        b.portfolio_percentage = Math.round(((b.usd_value || 0) / totalUsd) * 1000) / 10;
      }
    }

    return balances;
  } catch (err) {
    console.error("getAlchemyTokenBalances error:", err);
    return [];
  }
}

// ── Transaction Feed ─────────────────────────────────────────────
export async function getAlchemyTransactions(
  address: string,
  chain: string
): Promise<Transaction[]> {
  try {
    const raw = (await rpcCall(chain, "alchemy_getAssetTransfers", [
      {
        fromBlock: "0x0",
        toBlock: "latest",
        fromAddress: address,
        category: ["external", "erc20"],
        maxCount: "0x14",
        order: "desc",
      },
    ])) as {
      transfers?: Array<{
        hash: string;
        blockNum: string;
        from: string;
        to: string;
        value: number | null;
        metadata?: { blockTimestamp?: string };
      }>;
    } | null;

    if (!raw?.transfers || raw.transfers.length === 0) return [];

    return raw.transfers.map((tx) => ({
      hash: tx.hash || "",
      block_timestamp: tx.metadata?.blockTimestamp || new Date().toISOString(),
      from_address: tx.from || address,
      to_address: tx.to || "",
      value: tx.value ? tx.value.toString() : "0",
      gas_price: "20000000000",
      receipt_status: "1",
    }));
  } catch (err) {
    console.error("getAlchemyTransactions error:", err);
    return [];
  }
}

// ── NFTs ─────────────────────────────────────────────────────────
export async function getAlchemyNFTs(
  address: string,
  chain: string
): Promise<NFTItem[]> {
  const key = getApiKey();
  if (!key) return [];
  const host = ALCHEMY_CHAIN_HOSTS[chain] || ALCHEMY_CHAIN_HOSTS.eth;

  try {
    const url = `https://${host}.g.alchemy.com/nft/v3/${key}/getNFTsForOwner?owner=${address}&pageSize=18&withMetadata=true`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    const owned = data.ownedNfts as Array<{
      contract: { address: string; tokenType?: string };
      tokenId: string;
      name?: string;
      image?: { cachedUrl?: string; originalUrl?: string; pngUrl?: string };
    }>;

    if (!owned) return [];

    return owned.map((nft) => ({
      token_address: nft.contract?.address || "",
      token_id: nft.tokenId || "",
      name: nft.name || "NFT Item",
      symbol: "NFT",
      contract_type: nft.contract?.tokenType || "ERC721",
      collection_logo: nft.image?.cachedUrl || nft.image?.pngUrl || nft.image?.originalUrl || undefined,
    }));
  } catch (err) {
    console.error("getAlchemyNFTs error:", err);
    return [];
  }
}

// ── Token Approvals (Live On-Chain Allowance Checks) ─────────────
export async function getAlchemyTokenApprovals(
  address: string,
  chain: string
): Promise<TokenApproval[]> {
  try {
    const paddedOwner = address.toLowerCase().replace("0x", "").padStart(64, "0");
    const approvals: TokenApproval[] = [];

    // Query allowances for prominent spenders across key stablecoins/tokens
    const checks: Array<{ token: (typeof CORE_TOKENS)[0]; spender: (typeof NOTABLE_SPENDERS)[0] }> = [];
    for (const token of CORE_TOKENS.slice(0, 4)) {
      for (const spender of NOTABLE_SPENDERS.slice(0, 5)) {
        checks.push({ token, spender });
      }
    }

    const results = await Promise.all(
      checks.map(async ({ token, spender }) => {
        const paddedSpender = spender.address.toLowerCase().replace("0x", "").padStart(64, "0");
        // ERC-20 allowance selector: 0xdd62ed3e + owner + spender
        const data = `0xdd62ed3e${paddedOwner}${paddedSpender}`;

        const rawHex = (await rpcCall(chain, "eth_call", [
          { to: token.address, data },
          "latest",
        ])) as string | null;

        if (!rawHex || rawHex === "0x" || rawHex === "0x0" || /^0x0+$/.test(rawHex)) {
          return null;
        }

        const rawBig = BigInt(rawHex);
        if (rawBig === BigInt(0)) return null;

        const isUnlimited =
          rawBig.toString() === MAX_UINT256 ||
          rawBig >= BigInt("1000000000000000000000000000000"); // >= 10^30 is effectively infinite

        const formatted = isUnlimited
          ? "Unlimited ♾️"
          : (Number(rawBig) / Math.pow(10, token.decimals)).toFixed(2);

        return {
          token_address: token.address,
          token_symbol: token.symbol,
          token_name: token.symbol,
          spender_address: spender.address,
          approved_amount: rawBig.toString(),
          approved_amount_formatted: formatted,
          is_unlimited: isUnlimited,
          is_new_contract: spender.ageDays < 30,
          spender_contract_age_days: spender.ageDays,
          block_timestamp: new Date().toISOString(),
        } as TokenApproval;
      })
    );

    for (const r of results) {
      if (r) approvals.push(r);
    }

    return approvals;
  } catch (err) {
    console.error("getAlchemyTokenApprovals error:", err);
    return [];
  }
}

// ── Net Worth ────────────────────────────────────────────────────
export async function getAlchemyNetWorth(
  address: string,
  chain: string
): Promise<number> {
  const tokens = await getAlchemyTokenBalances(address, chain);
  return tokens.reduce((acc, t) => acc + (t.usd_value || 0), 0);
}

// ── Wallet Age ───────────────────────────────────────────────────
export async function getAlchemyWalletAge(
  address: string,
  chain: string
): Promise<number> {
  const txs = await getAlchemyTransactions(address, chain);
  if (txs.length === 0) return 0;
  const oldest = txs[txs.length - 1];
  if (!oldest.block_timestamp) return 0;
  const firstTime = new Date(oldest.block_timestamp).getTime();
  const diff = Date.now() - firstTime;
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function isAlchemyWhale(netWorth: number): boolean {
  return netWorth >= WHALE_THRESHOLD_USD;
}
