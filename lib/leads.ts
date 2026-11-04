/**
 * Lead management — upsert Telegram users and log audits in Neon DB.
 */

import { sql } from "@/lib/db";

// ── Upsert lead (called on every audit) ─────────────────────────
export async function upsertLead(params: {
  telegram_id: number;
  username?: string;
  first_name?: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await sql`
      INSERT INTO leads (telegram_id, username, first_name)
      VALUES (${params.telegram_id}, ${params.username ?? null}, ${params.first_name ?? null})
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        username   = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        updated_at = NOW()
    `;
  } catch (err) {
    console.error("upsertLead error:", err);
  }
}

// ── Mark lead as "agent" intent (hot lead) ──────────────────────
export async function markAgentIntent(telegram_id: number): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await sql`
      UPDATE leads
      SET intent = 'agent', updated_at = NOW()
      WHERE telegram_id = ${telegram_id}
    `;
  } catch (err) {
    console.error("markAgentIntent error:", err);
  }
}

// ── Log an audit run ─────────────────────────────────────────────
export async function logAudit(params: {
  telegram_id: number;
  wallet_address: string;
  chain: string;
  risk_score: number;
  report_text: string;
  approval_count: number;
  unlimited_count: number;
  raw_approvals?: object;
  raw_transactions?: object;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await sql`
      INSERT INTO audit_logs (
        telegram_id, wallet_address, chain, risk_score,
        report_text, approval_count, unlimited_count,
        raw_approvals, raw_transactions
      ) VALUES (
        ${params.telegram_id},
        ${params.wallet_address.toLowerCase()},
        ${params.chain},
        ${params.risk_score},
        ${params.report_text},
        ${params.approval_count},
        ${params.unlimited_count},
        ${JSON.stringify(params.raw_approvals ?? [])}::jsonb,
        ${JSON.stringify(params.raw_transactions ?? [])}::jsonb
      )
    `;
  } catch (err) {
    console.error("logAudit error:", err);
  }
}

// ── Get last scanned wallet for a lead (for AGENT notification) ──
export async function getLastWallet(
  telegram_id: number
): Promise<string | undefined> {
  if (!process.env.DATABASE_URL) return undefined;
  try {
    const rows = await sql`
      SELECT wallet_address
      FROM audit_logs
      WHERE telegram_id = ${telegram_id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return rows[0]?.wallet_address as string | undefined;
  } catch (err) {
    console.error("getLastWallet error:", err);
    return undefined;
  }
}

// ── Total audit count (for landing page stats) ───────────────────
export async function getTotalAuditCount(): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  try {
    const rows = await sql`SELECT COUNT(*)::int AS count FROM audit_logs`;
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}
