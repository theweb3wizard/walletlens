/**
 * Database migration — run once to create WalletLens tables on Neon.
 *
 * Usage:
 *   1. Add DATABASE_URL to your .env.local
 *   2. Run: npm run db:migrate
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local without dotenv dependency
function loadEnv(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(path.resolve(process.cwd(), ".env.local"));
loadEnv(path.resolve(process.cwd(), ".env"));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate(): Promise<void> {
  console.log("🔄  Running WalletLens database migrations...\n");

  // ── leads ──────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id           SERIAL PRIMARY KEY,
      telegram_id  BIGINT  UNIQUE NOT NULL,
      username     TEXT,
      first_name   TEXT,
      intent       TEXT    NOT NULL DEFAULT 'scan',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅  Table 'leads' ready.");

  // ── audit_logs ─────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id               SERIAL PRIMARY KEY,
      telegram_id      BIGINT  REFERENCES leads(telegram_id) ON DELETE SET NULL,
      wallet_address   TEXT    NOT NULL,
      chain            TEXT    NOT NULL DEFAULT 'eth',
      risk_score       INTEGER,
      report_text      TEXT,
      approval_count   INTEGER NOT NULL DEFAULT 0,
      unlimited_count  INTEGER NOT NULL DEFAULT 0,
      raw_approvals    JSONB,
      raw_transactions JSONB,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅  Table 'audit_logs' ready.");

  // ── analyses (web dashboard, slug-indexed) ─────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id                       SERIAL PRIMARY KEY,
      slug                     TEXT UNIQUE NOT NULL,
      wallet_address           TEXT NOT NULL,
      chain                    TEXT NOT NULL DEFAULT 'eth',
      token_data               JSONB,
      nft_data                 JSONB,
      transaction_data         JSONB,
      approval_data            JSONB,
      net_worth                NUMERIC,
      ai_report                TEXT,
      risk_score               INTEGER,
      wallet_age_days          INTEGER,
      is_whale                 BOOLEAN DEFAULT FALSE,
      unlimited_approval_count INTEGER DEFAULT 0,
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅  Table 'analyses' ready.");

  // ── indexes ────────────────────────────────────────────────────
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_telegram_id ON audit_logs(telegram_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_wallet ON audit_logs(wallet_address)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_intent ON leads(intent)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_analyses_slug ON analyses(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_analyses_wallet ON analyses(wallet_address)`;
  console.log("✅  Indexes created.");

  // ── updated_at trigger ─────────────────────────────────────────
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `;
  await sql`DROP TRIGGER IF EXISTS leads_set_updated_at ON leads`;
  await sql`
    CREATE TRIGGER leads_set_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `;
  console.log("✅  Auto-updated_at trigger set on 'leads'.");

  console.log("\n🎉  Migration complete. Your Neon database is ready.");
}

migrate().catch((err: unknown) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
