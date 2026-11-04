// ── Token Approval (new — core B2B feature) ─────────────────────
export interface TokenApproval {
  token_address: string;
  token_symbol: string;
  token_name: string;
  spender_address: string;
  approved_amount: string;       // raw value — check against MAX_UINT256
  approved_amount_formatted: string;
  is_unlimited: boolean;
  is_new_contract: boolean;      // spender first seen < 30 days ago
  spender_contract_age_days: number | null;
  block_timestamp: string;
}

// ── Token Balance ────────────────────────────────────────────────
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

// ── NFT Item ─────────────────────────────────────────────────────
export interface NFTItem {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  contract_type: string;
  collection_logo?: string;
}

// ── Transaction ──────────────────────────────────────────────────
export interface Transaction {
  hash: string;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  gas_price: string;
  receipt_status: string;
}

// ── Full Wallet Analysis (stored in audit_logs) ──────────────────
export interface WalletAnalysis {
  id: string;
  slug: string;
  wallet_address: string;
  chain: string;
  token_data: TokenBalance[];
  nft_data: NFTItem[];
  transaction_data: Transaction[];
  approval_data: TokenApproval[];
  net_worth: number;
  ai_report: string;
  risk_score: number;
  wallet_age_days: number;
  is_whale: boolean;
  unlimited_approval_count: number;
  created_at: string;
}

// ── Audit Input passed to Groq ───────────────────────────────────
export interface AuditInput {
  wallet_address: string;
  chain: string;
  approvals: TokenApproval[];
  recent_transactions: Transaction[];
  net_worth: number;
  wallet_age_days: number;
  token_count: number;
}

// ── Lead (Telegram user) ─────────────────────────────────────────
export interface Lead {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  intent: "scan" | "agent";
  created_at: string;
  updated_at: string;
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
