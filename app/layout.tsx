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
  title: "Product Engineer · Full-Stack Web3 Engineer · Portfolio",
  description:
    "High-execution full-stack Web3 engineering. AI-native orchestration across the entire stack — from smart contracts to responsive UI. SolPulse, Valor, TxPreview, WalletLens.",
  keywords: ["product engineer", "full-stack web3", "frontend web3", "solana", "ethereum", "AI", "blockchain"],
  openGraph: {
    title: "Product Engineer · Full-Stack Web3 Engineer",
    description: "High-execution full-stack Web3 engineering. AI-native orchestration — from smart contracts to responsive UI.",
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