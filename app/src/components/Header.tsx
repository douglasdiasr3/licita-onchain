"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

// Wallet button precisa ser dynamic pra evitar SSR mismatch
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export function Header() {
  const { connected } = useWallet();

  return (
    <header className="border-b bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            Licita <span className="text-teal">OnChain</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {connected && (
            <>
              <Link href="/licitations" className="text-sm hover:text-teal font-medium">
                Licitações
              </Link>
              <Link href="/new" className="text-sm hover:text-teal font-medium">
                Criar
              </Link>
              <Link href="/profile" className="text-sm hover:text-teal font-medium">
                Meu Perfil
              </Link>
            </>
          )}
          <WalletMultiButton style={{ height: 40, fontSize: 14 }} />
        </nav>
      </div>
    </header>
  );
}
