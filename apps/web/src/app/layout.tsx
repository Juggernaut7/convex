import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import { AuthProvider } from "@/components/auth/auth-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "convex",
  description: "a next gen conviction market and sport prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} bg-[#F5F5F5] text-[#111827]`}>
        <div className="relative flex min-h-screen flex-col">
          <AuthProvider>
            <WalletProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
            </WalletProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
