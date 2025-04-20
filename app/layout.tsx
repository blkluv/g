import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Providers from "./providers";
import ConnectWallet from "@/components/ConnectWallet";
import WalletPopup from "@/components/WalletPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polkadot Tourism",
  description: "A mobile-first tourism app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}>
        <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
          <div className="relative w-full max-w-[430px] h-[932px] bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="relative h-full w-full flex flex-col">
                <Providers>
                  <WalletPopup />
                  <div className="flex-1 relative mx-3">
                    {children}
                  </div>
                  <BottomNav />
                </Providers>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
