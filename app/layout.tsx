import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://walletlens.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TreasuryWizard — AI Web3 Treasury Audit & Wallet Security Scanner",
    template: "%s | TreasuryWizard",
  },
  description:
    "Free AI-powered Web3 treasury auditor. Scan any EVM wallet for unlimited token approvals, risky contract interactions, and security vulnerabilities. Instant risk score for DAO treasuries, Gnosis Safe wallets, and Web3 project founders.",
  keywords: [
    "Web3 treasury audit",
    "DAO wallet security",
    "crypto approval scanner",
    "AI wallet risk assessment",
    "EVM security audit",
    "token approval checker",
    "Gnosis Safe audit",
    "DeFi wallet scanner",
    "unlimited token approval",
    "Web3 security tool",
    "blockchain wallet audit",
    "DAO treasurer tool",
    "crypto wallet health check",
    "treasury management Web3",
  ],
  authors: [{ name: "The Web3 Wizard" }],
  creator: "The Web3 Wizard",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "TreasuryWizard",
    title: "TreasuryWizard — AI Web3 Treasury Audit Tool",
    description:
      "Scan your project wallet for unlimited token approvals and security risks in 15 seconds. Free AI audit for Web3 founders and DAO treasurers. No wallet connection required.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@theweb3wizard",
    creator: "@theweb3wizard",
    title: "TreasuryWizard — AI Web3 Treasury Audit Tool",
    description:
      "Free AI wallet security audit for Web3 founders and DAOs. Detects unlimited approvals, risky contracts, and more — in 15 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD structured data for SEO/AEO/GEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TreasuryWizard",
  applicationCategory: "SecurityApplication",
  applicationSubCategory: "Web3 Treasury Audit Tool",
  operatingSystem: "Web, Telegram",
  url: SITE_URL,
  description:
    "AI-powered Web3 treasury auditor. Scans EVM wallets for unlimited token approvals, risky contract interactions, and security vulnerabilities. Delivers plain-English risk reports via Telegram and web dashboard.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free AI wallet security audit",
  },
  featureList: [
    "Unlimited token approval detection (max uint256 scanning)",
    "Risky spender contract identification",
    "AI risk scoring 1–100 via Groq Llama 3.1 70B",
    "Telegram-native report delivery",
    "DAO treasury and Gnosis Safe compatibility",
    "Recent transaction counterparty analysis",
    "Actionable security recommendations",
    "Multi-chain support: Ethereum, Polygon, BNB, Arbitrum, Base",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Web3 founders, DAO treasurers, crypto project managers",
  },
  provider: {
    "@type": "Person",
    name: "The Web3 Wizard",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-void text-slate-200 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
