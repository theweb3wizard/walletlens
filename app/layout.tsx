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

export const metadata: Metadata = {
  title: "WalletLens — AI-Powered Wallet Intelligence",
  description:
    "Paste any EVM wallet address and get an instant AI-generated intelligence report. Token holdings, NFTs, transaction history, risk score and more.",
  keywords: ["crypto", "wallet", "blockchain", "AI", "DeFi", "ethereum", "analysis"],
  openGraph: {
    title: "WalletLens — AI-Powered Wallet Intelligence",
    description: "Instant AI analysis for any EVM wallet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-void text-slate-200 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}