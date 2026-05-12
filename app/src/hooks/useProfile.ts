import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/lib/anchor";

export type UserRole = "Pregoeiro" | "Fornecedor";

export interface UserProfile {
  name: string;
  document: string;
  role: UserRole;
  authority: string;
}

export function useProfile() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !publicKey) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const [profilePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("profile"), publicKey.toBuffer()],
          program.programId
        );
        const data: any = await program.account.userProfile.fetch(profilePda);
        
        if (isMounted) {
          setProfile({
            name: data.name,
            document: data.document,
            role: Object.keys(data.role)[0] === "pregoeiro" ? "Pregoeiro" : "Fornecedor",
            authority: data.authority.toBase58(),
          });
        }
      } catch (err) {
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [program, publicKey]);

  return { profile, loading };
}
