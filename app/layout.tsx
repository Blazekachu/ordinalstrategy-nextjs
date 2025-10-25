import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivyProvider from "@/components/PrivyProvider";
import { XverseWalletProvider } from "@/components/XverseWalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ordinal Strategy | Precision in Bitcoin Ordinals",
  description: "Ordinal Strategy is a framework for research, tracking, and optimization across Bitcoin Ordinals, built for collectors, creators, and strategists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <PrivyProvider>
          <XverseWalletProvider>
            {children}
          </XverseWalletProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
