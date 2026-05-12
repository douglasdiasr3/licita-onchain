import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Licita OnChain",
  description: "Licitações públicas transparentes na Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-gray-500">
              Licita OnChain · Construído em Solana · Hackathon Solana
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
