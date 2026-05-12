import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "./idl.json";
import { LicitaOnchain } from "./licita_onchain";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "9Cif5osZpEmSnf5uWC21TL7oYgowjXd5k6EfkKYrbg9f"
);

/**
 * Hook que retorna o Program Anchor pronto pra uso.
 * Retorna null se a wallet não está conectada.
 */
export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    // Cria um provider fallback (read-only) se a carteira não estiver conectada
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error("Read only"); },
      signAllTransactions: async () => { throw new Error("Read only"); },
    };

    const provider = new AnchorProvider(
      connection,
      (wallet as any) || dummyWallet,
      {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      }
    );

    return new Program(idl as LicitaOnchain, provider);
  }, [connection, wallet]);
}

/**
 * Deriva o PDA de uma licitação a partir do pregoeiro + hash do edital.
 */
export function deriveLicitationPda(
  authority: PublicKey,
  editalHash: Uint8Array
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("licitation"), authority.toBuffer(), Buffer.from(editalHash)],
    PROGRAM_ID
  );
}

/**
 * Deriva o PDA de uma proposta (uma por bidder por licitação).
 */
export function deriveProposalPda(
  licitation: PublicKey,
  bidder: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), licitation.toBuffer(), bidder.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Connection somente leitura (para queries sem wallet).
 */
export function getReadOnlyConnection(): Connection {
  return new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );
}
