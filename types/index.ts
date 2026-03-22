export interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  balance: string;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  portfolio_percentage?: number;
}

export interface NFTItem {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  contract_type: string;
  collection_logo?: string;
}

export interface Transaction {
  hash: string;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  gas_price: string;
  receipt_status: string;
}

export interface WalletAnalysis {
  id: string;
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
}

export interface AnalysisRequest {
  wallet_address: string;
  chain: string;
}

export interface RiskLevel {
  label: string;
  color: string;
  description: string;
}

export type Chain = "eth" | "polygon" | "bsc" | "arbitrum" | "optimism" | "base";

export interface ChainConfig {
  id: Chain;
  name: string;
  symbol: string;
  color: string;
  icon: string;
}
