import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeContextProvider from "@/context/theme-context";
import ThemeSwitch from "@/components/ui/theme-switch";
import { WalletProvider } from "@/context/wallet-context";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Krypt: Secure Web3 Wallet | Manage Crypto & NFTs Easily",
  description:
    "Krypt: The all-in-one Web3 wallet for seamless crypto management, NFT trading, and dApp interaction. Secure, user-friendly, and built for the decentralized future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <body className={`bg-white dark:bg-gray-950 ${inter.className}`}>
        <WalletProvider>
          <ThemeContextProvider>
            {children}
            <Toaster />
            <ThemeSwitch />
          </ThemeContextProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
