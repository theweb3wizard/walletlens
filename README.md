# TreasuryWizard (v2.0) — AI Web3 Treasury Security Auditor

> **Scan any EVM wallet for unlimited token approvals, risky contracts, and security vulnerabilities. Get an instant AI risk score in under 15 seconds. Free. Read-only. No wallet connection or signature required.**

![TreasuryWizard](https://img.shields.io/badge/TreasuryWizard-v2.0-6366F1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Alchemy](https://img.shields.io/badge/Alchemy-Enhanced_APIs-0052FF?style=for-the-badge&logo=alchemy)
![Groq](https://img.shields.io/badge/Groq-Llama_3.1_70B-F55036?style=for-the-badge)
![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql)
![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## Table of Contents

- [Overview](#overview)
- [The Problem It Solves](#the-problem-it-solves)
- [Key Features](#key-features)
- [Architecture & Data Flow](#architecture--data-flow)
- [Tech Stack](#tech-stack)
- [Database Schema (Neon Postgres)](#database-schema-neon-postgres)
- [API Reference](#api-reference)
- [Supported Chains](#supported-chains)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
  - [Running Tests](#running-tests)
- [Telegram Bot Setup & Webhook Registration](#telegram-bot-setup--webhook-registration)
- [Deployment Guide (Vercel)](#deployment-guide-vercel)
- [Security & Risk Scoring Engine](#security--risk-scoring-engine)
- [License](#license)

---

## Overview

**TreasuryWizard** is an enterprise-grade Web3 treasury security scanner built for **DAO treasurers, crypto founders, and multi-sig signers (e.g. Gnosis Safe)**.

Treasuries interact with dozens of decentralized exchanges, bridges, staking contracts, and lending pools over time. In doing so, they routinely grant **unlimited token approvals** (`type(uint256).max`), leaving vaults exposed to protocol exploits, compromised proxy upgrades, and rogue spenders long after active trading stops.

TreasuryWizard continuously uncovers these vulnerabilities and synthesizes findings into an executive-ready **Wallet Health Report** with a **Risk Score (1–100)** delivered via an interactive web dashboard and a native Telegram bot.

---

## The Problem It Solves

| Traditional Experience | TreasuryWizard Solution |
| :--- | :--- |
| **Silent drain vectors:** Forgotten unlimited allowances remain open to deprecated contracts. | **Automatic detection:** Proactively detects `MAX_UINT256` permissions on Uniswap, 1inch, 0x, Permit2, Seaport, and custom spenders. |
| **High barrier to entry:** Tools require connecting multi-sig hardware wallets or signing messages. | **100% Read-Only:** Audits any EVM address from public on-chain state without asking for wallet connections or signatures. |
| **Complex raw hex logs:** Block explorers display raw hexadecimal calldata and approvals difficult for non-technical treasurers to parse. | **AI synthesis:** Groq (Llama 3.1 70B) translates on-chain metrics into plain English with clear remediation steps. |
| **Fragmented team workflows:** Reports trapped in individual browser sessions. | **Dual delivery:** Instant Telegram bot alerts (`@TreasuryWizardBot`) plus unique shareable web URLs (`/report/[slug]`). |

---

## Key Features

- 🔍 **Unlimited Allowance Scanner:** Identifies token approvals set to `115792089237316195423570985008687907853269984665640564039457584007913129639935` (`2^256 - 1`) and classifies them as **Critical Risk**.
- ⚠️ **Spender Contract Age Analysis:** Calculates deployment age of counterparty contracts, highlighting contracts deployed `< 30 days` ago.
- 📊 **AI-Powered Risk Scoring (1–100):** Leverages **Groq Llama 3.1 70B Versatile** to evaluate allowance sprawl, counterparty reputations, and wallet age into an intelligible score.
- 🛡️ **Fault-Tolerant Deterministic Fallback:** If AI APIs experience rate-limits or downtime, an automated rule-based analysis engine guarantees 100% audit uptime.
- ⚡ **Dual Blockchain Engine (Alchemy + Moralis):** Powered by Alchemy Enhanced APIs (Token Balances, Asset Transfers, NFT API, and RPC allowances) with automatic Moralis fallback and offline demo simulation.
- 🌐 **Interactive Web Dashboard:** Modern dark-mode UI with SVG risk gauges, portfolio breakdowns, approvals panel, token holdings, and real-time transaction feeds.
- 🔗 **Permanent Shareable Reports:** Every audit generates a slug-indexed permalink (`/report/[slug]`) stored in Neon Serverless Postgres.
- 🤖 **Telegram Lead Capture Pipeline:** When users reply `AGENT` to `@TreasuryWizardBot`, the bot records high-intent leads and sends a direct Calendly booking invitation while alerting the operator.
- 🌍 **Multi-Chain Ready:** Live support across Ethereum, Polygon, BNB Chain, Arbitrum, Base, and Optimism.

---

## Architecture & Data Flow

```
                      ┌──────────────────────────────────────┐
                      │             USER ENTRY               │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │   Web UI Dashboard    │                       │     Telegram Bot      │
     │      (Next.js 14)     │                       │  (@TreasuryWizardBot) │
     └───────────┬───────────┘                       └───────────┬───────────┘
                 │ POST /api/analyze                             │ POST /api/telegram/webhook
                 └───────────────────────┬───────────────────────┘
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          BLOCKCHAIN DATA ENGINE       │
                     │  - Alchemy Enhanced APIs (Primary)   │
                     │  - Moralis API v2.2 (Fallback)       │
                     └───────────────────┬───────────────────┘
                                         │ Parallel Fetch:
                                         │  • ERC-20 Balances & Native Balance
                                         │  • Token Approvals (eth_call allowances)
                                         │  • Recent Transfers & Transaction Feed
                                         │  • NFT Holdings
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          AI AUDIT SYNTHESIS           │
                     │  - Groq Llama 3.1 70B (Primary)       │
                     │  - Deterministic Rule Engine (Backup) │
                     └───────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │  Neon Postgres DB     │                       │ In-Memory Fallback    │
     │  - analyses table     │                       │ (Zero-Downtime Cache) │
     │  - audit_logs table   │                       │ (lib/store.ts)        │
     │  - leads table        │                       └───────────────────────┘
     └───────────┬───────────┘
                 ▼
     ┌───────────────────────┐
     │   OUTPUT / DELIVERY   │
     │  • /report/[slug]     │
     │  • Telegram Message   │
     └───────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | Server-rendered API routes, dynamic pages, static generation |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) | Responsive dark UI, glow effects, interactive micro-animations |
| **Blockchain** | [Alchemy Enhanced APIs](https://www.alchemy.com/) | Real-time token balances, transfers, NFTs, on-chain allowances |
| **Fallback Data** | [Moralis API v2.2](https://moralis.io/) | Alternate blockchain data provider |
| **AI Auditor** | [Groq SDK](https://groq.com/) (`llama-3.1-70b-versatile`) | Instant natural-language security synthesis |
| **Database** | [Neon Serverless Postgres](https://neon.tech/) | Serverless PostgreSQL storage (`@neondatabase/serverless`) |
| **Messaging** | Telegram Bot API | Direct webhook-based bot responses & operator notifications |
| **Deployment** | [Vercel](https://vercel.com/) | Edge-network hosting and serverless function execution |

---

## Database Schema (Neon Postgres)

TreasuryWizard uses three primary tables in Neon Postgres migrated via [scripts/migrate.ts](file:///c:/Users/KHALID%20PC/Documents/Github%20Projects/walletlens/scripts/migrate.ts):

### 1. `analyses` (Web Dashboard Shareable Reports)
Stores complete snapshot data for every web-initiated audit:
```sql
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
);

CREATE INDEX idx_analyses_slug ON analyses(slug);
CREATE INDEX idx_analyses_wallet ON analyses(wallet_address);
```

### 2. `audit_logs` (Historical Audit Log)
Captures audit runs across both Web and Telegram:
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id               SERIAL PRIMARY KEY,
  telegram_id      BIGINT REFERENCES leads(telegram_id) ON DELETE SET NULL,
  wallet_address   TEXT NOT NULL,
  chain            TEXT NOT NULL DEFAULT 'eth',
  risk_score       INTEGER,
  report_text      TEXT,
  approval_count   INTEGER NOT NULL DEFAULT 0,
  unlimited_count  INTEGER NOT NULL DEFAULT 0,
  raw_approvals    JSONB,
  raw_transactions JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_telegram_id ON audit_logs(telegram_id);
CREATE INDEX idx_audit_logs_wallet ON audit_logs(wallet_address);
```

### 3. `leads` (Telegram User Pipeline)
Tracks Telegram users, intent state (`scan` vs `agent`), and contact timestamps:
```sql
CREATE TABLE IF NOT EXISTS leads (
  id           SERIAL PRIMARY KEY,
  telegram_id  BIGINT UNIQUE NOT NULL,
  username     TEXT,
  first_name   TEXT,
  intent       TEXT NOT NULL DEFAULT 'scan',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_intent ON leads(intent);
```

---

## API Reference

### 1. Run Security Analysis
Trigger a full security scan on any EVM wallet address:
- **Endpoint:** `POST /api/analyze`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "wallet_address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chain": "eth"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "slug": "efn01p3na83bmlqo",
    "cached": false
  }
  ```

### 2. Fetch Stored Audit Report
Retrieve full audit details for a specific report slug:
- **Endpoint:** `GET /api/report/[slug]`
- **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "slug": "efn01p3na83bmlqo",
    "wallet_address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    "chain": "eth",
    "net_worth": 146633.50,
    "risk_score": 78,
    "wallet_age_days": 540,
    "is_whale": false,
    "unlimited_approval_count": 2,
    "ai_report": "🧙‍♂️ **TreasuryWizard Audit Report**\n\n...",
    "approval_data": [...],
    "token_data": [...],
    "transaction_data": [...],
    "created_at": "2026-11-04T14:29:43.000Z"
  }
  ```

### 3. Audit Statistics
Returns aggregate count of all audits completed:
- **Endpoint:** `GET /api/stats`
- **Response (`200 OK`):**
  ```json
  { "count": 1420 }
  ```

### 4. Telegram Webhook Handler
Receives inbound messages and commands from Telegram Bot API:
- **Endpoint:** `POST /api/telegram/webhook`
- **Header:** `X-Telegram-Bot-Api-Secret-Token: <TELEGRAM_WEBHOOK_SECRET>`

### 5. Telegram Webhook Registration
Registers your production domain with Telegram Bot API:
- **Endpoint:** `POST /api/telegram/register`

---

## Supported Chains

| Chain | Network Identifier | Alchemy Host | Standard Native Asset |
| :--- | :--- | :--- | :--- |
| **Ethereum** | `eth` | `eth-mainnet` | ETH |
| **Polygon** | `polygon` | `polygon-mainnet` | POL / MATIC |
| **BNB Chain** | `bsc` | `bnb-mainnet` | BNB |
| **Arbitrum One** | `arbitrum` | `arb-mainnet` | ETH |
| **Base** | `base` | `base-mainnet` | ETH |
| **Optimism** | `optimism` | `opt-mainnet` | ETH |

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** (or `pnpm` / `yarn`)
- **API Keys**:
  - Alchemy API Key ([dashboard.alchemy.com](https://dashboard.alchemy.com))
  - Groq API Key ([console.groq.com](https://console.groq.com))
  - Neon Serverless Postgres DB ([console.neon.tech](https://console.neon.tech))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/theweb3wizard/walletlens.git
cd walletlens

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
```

### Environment Variables

Configure `.env.local` with your credentials:

```env
# ── Blockchain Data (Primary: Alchemy) ───────────────────────────
ALCHEMY_API_KEY=your_alchemy_api_key_here
# Optional fallback (Moralis)
MORALIS_API_KEY=

# ── AI Analysis ──────────────────────────────────────────────────
GROQ_API_KEY=gsk_your_groq_api_key_here

# ── Database (Neon Serverless Postgres) ──────────────────────────
DATABASE_URL=postgresql://neondb_owner:password@ep-cool-name.region.aws.neon.tech/neondb?sslmode=require

# ── App URL ──────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── Telegram Bot (Optional for web-only usage) ───────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_OPERATOR_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=

# ── Lead Booking Link ────────────────────────────────────────────
CALENDLY_URL=https://calendly.com/your-team/15min
```

### Database Setup

Run the migration script to automatically build tables and indexes on Neon:

```bash
npm run db:migrate
```

### Running the App

```bash
# Development server
npm run dev

# Production build & start
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) to start auditing wallets.

### Running Tests

Execute the automated integration test suite covering address checksums, blockchain data retrieval, Groq AI reports, and Neon/Memory persistence:

```bash
npm test
```

---

## Telegram Bot Setup & Webhook Registration

1. **Create the bot**:
   - Open Telegram, search for `@BotFather`, and send `/newbot`.
   - Name your bot (e.g. `TreasuryWizard`) and choose a handle (e.g. `@YourTreasuryWizardBot`).
   - Copy the HTTP token and set it as `TELEGRAM_BOT_TOKEN` in your environment.
2. **Retrieve your Chat ID** (for operator notifications):
   - Send any direct message to your new bot.
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Copy the numerical `id` under `message.chat.id` into `TELEGRAM_OPERATOR_CHAT_ID`.
3. **Register Webhook**:
   - Once deployed to Vercel (or with an `ngrok` tunnel during development):
     ```bash
     curl -X POST https://your-production-domain.com/api/telegram/register
     ```

---

## Deployment Guide (Vercel)

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Set the Environment Variables under **Project Settings → Environment Variables**:
   - `ALCHEMY_API_KEY`
   - `GROQ_API_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel URL e.g. `https://your-app.vercel.app`)
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `TELEGRAM_OPERATOR_CHAT_ID` (optional)
   - `TELEGRAM_WEBHOOK_SECRET` (optional)
   - `CALENDLY_URL` (optional)
4. Click **Deploy**.
5. Trigger webhook registration:
   ```bash
   curl -X POST https://your-app.vercel.app/api/telegram/register
   ```

---

## Security & Risk Scoring Engine

### Scoring Formula
The Risk Score ($1 - 100$) is synthesized as follows:
- **Baseline Healthy Score:** `10`
- **Unlimited Approvals Penalty:** `+25` per unlimited approval (`MAX_UINT256`)
- **New Spender Contract Penalty:** `+10` per approval where spender contract age is `< 30 days`
- **Approval Sprawl Penalty:** `+2` per active approval (capped at `+20`)
- **Final Range:** Clamped between `1` (Extremely Safe) and `100` (Critical Vulnerability)

### Security Safeguards
- **Zero Signing Requirement:** TreasuryWizard is strictly read-only. It never connects to Web3 browser wallets, requests signatures, or asks for private keys or seed phrases.
- **SQL Sanitization:** Built using `@neondatabase/serverless` tagged template literals preventing SQL injection attacks.
- **Webhook Authentication:** Verifies the cryptographic `X-Telegram-Bot-Api-Secret-Token` header on all inbound webhook calls.

---

## License

This project is licensed under the [MIT License](LICENSE).
