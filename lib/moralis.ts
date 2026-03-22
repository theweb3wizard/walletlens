import { TokenBalance, NFTItem, Transaction } from "@/types";
import { MORALIS_CHAIN_MAP, WHALE_THRESHOLD_USD } from "@/constants";

const BASE_URL = "https://deep-index.moralis.io/api/v2.2";

async function moralisFetch(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
      "X-API-Key": process.env.MORALIS_API_KEY!,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Moralis API error: ${res.status} ${path}`);
    return null;
  }

  return res.json();
}

export async function getTokenBalances(
  address: string,
  chain: string
): Promise<TokenBalance[]> {
  try {
    const chainId = MORALIS_CHAIN_MAP[chain] || "0x1";
    const data = (await moralisFetch(
      `/wallets/${address}/tokens?chain=${chainId}`
    )) as { result?: MoralisTokenRaw[] } | null;

    if (!data?.result) return [];

    return data.result.map((token) => ({
      token_address: token.token_address || "",
      symbol: token.symbol || "UNKNOWN",
      name: token.name || "Unknown Token",
      logo: token.logo || undefined,
      balance: token.balance || "0",
      balance_formatted: token.balance_formatted || "0",
      usd_price: token.usd_price || 0,
      usd_value: token.usd_value || 0,
      portfolio_percentage: token.portfolio_percentage || 0,
    }));
  } catch (err) {
    console.error("getTokenBalances error:", err);
    return [];
  }
}

export async function getNFTs(
  address: string,
  chain: string
): Promise<NFTItem[]> {
  try {
    const chainId = MORALIS_CHAIN_MAP[chain] || "0x1";
    const data = (await moralisFetch(
      `/${address}/nft?chain=${chainId}&limit=20&format=decimal`
    )) as { result?: MoralisNFTRaw[] } | null;

    if (!data?.result) return [];

    return data.result.map((nft) => ({
      token_address: nft.token_address || "",
      token_id: nft.token_id || "",
      name: nft.name || undefined,
      symbol: nft.symbol || undefined,
      contract_type: nft.contract_type || "ERC721",
      collection_logo: nft.collection_logo || undefined,
    }));
  } catch (err) {
    console.error("getNFTs error:", err);
    return [];
  }
}

export async function getTransactions(
  address: string,
  chain: string
): Promise<Transaction[]> {
  try {
    const chainId = MORALIS_CHAIN_MAP[chain] || "0x1";
    const data = (await moralisFetch(
      `/${address}?chain=${chainId}&limit=20`
    )) as { result?: MoralisTxRaw[] } | null;

    if (!data?.result) return [];

    return data.result.map((tx) => ({
      hash: tx.hash || "",
      block_timestamp: tx.block_timestamp || "",
      from_address: tx.from_address || "",
      to_address: tx.to_address || "",
      value: tx.value || "0",
      gas_price: tx.gas_price || "0",
      receipt_status: tx.receipt_status || "1",
    }));
  } catch (err) {
    console.error("getTransactions error:", err);
    return [];
  }
}

export async function getNetWorth(
  address: string,
  chain: string
): Promise<number> {
  try {
    const chainId = MORALIS_CHAIN_MAP[chain] || "0x1";
    const data = (await moralisFetch(
      `/wallets/${address}/net-worth?chains=${chainId}&exclude_spam=true`
    )) as { total_networth_usd?: string } | null;

    return parseFloat(data?.total_networth_usd || "0");
  } catch (err) {
    console.error("getNetWorth error:", err);
    return 0;
  }
}

export async function getWalletAge(
  address: string,
  chain: string
): Promise<number> {
  try {
    const chainId = MORALIS_CHAIN_MAP[chain] || "0x1";
    const data = (await moralisFetch(
      `/${address}?chain=${chainId}&limit=1&order=ASC`
    )) as { result?: MoralisTxRaw[] } | null;

    const firstTx = data?.result?.[0];
    if (!firstTx?.block_timestamp) return 0;

    const firstDate = new Date(firstTx.block_timestamp);
    const now = new Date();
    return Math.floor(
      (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  } catch (err) {
    console.error("getWalletAge error:", err);
    return 0;
  }
}

export function isWhale(netWorth: number): boolean {
  return netWorth >= WHALE_THRESHOLD_USD;
}

// Raw API response types
interface MoralisTokenRaw {
  token_address?: string;
  symbol?: string;
  name?: string;
  logo?: string;
  balance?: string;
  balance_formatted?: string;
  usd_price?: number;
  usd_value?: number;
  portfolio_percentage?: number;
}

interface MoralisNFTRaw {
  token_address?: string;
  token_id?: string;
  name?: string;
  symbol?: string;
  contract_type?: string;
  collection_logo?: string;
}

interface MoralisTxRaw {
  hash?: string;
  block_timestamp?: string;
  from_address?: string;
  to_address?: string;
  value?: string;
  gas_price?: string;
  receipt_status?: string;
}