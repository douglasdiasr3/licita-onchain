"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram, deriveLicitationPda } from "@/lib/anchor";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import { sha256File } from "@/lib/crypto";
import { SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { toast } from "sonner";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";

export default function NewLicitationPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const program = useProgram();
  const { profile, loading: loadingProfile } = useProfile();

  const [title, setTitle] = useState("Pregão 001/2026 - Notebooks");
  const [description, setDescription] = useState("Aquisição de notebooks para equipar o laboratório de tecnologia da prefeitura.");
  const [editalUri, setEditalUri] = useState(
    "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  );
  const [estimatedValue, setEstimatedValue] = useState(formatCurrencyInput("50000000"));
  const [commitDuration, setCommitDuration] = useState("60"); // segundos
  const [revealDuration, setRevealDuration] = useState("120");
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !program) {
      toast.error("Conecte sua carteira primeiro");
      return;
    }

    setSubmitting(true);
    try {
      // Hash do edital: ou do PDF carregado, ou aleatório (demo)
      let editalHash: Uint8Array;
      if (editalFile) {
        editalHash = await sha256File(editalFile);
      } else {
        editalHash = new Uint8Array(32);
        crypto.getRandomValues(editalHash);
      }

      const [licitationPda] = deriveLicitationPda(publicKey, editalHash);

      const now = Math.floor(Date.now() / 1000);
      const commitEnd = new BN(now + parseInt(commitDuration));
      const revealEnd = new BN(now + parseInt(commitDuration) + parseInt(revealDuration));
      
      const parsedValue = parseCurrencyInput(estimatedValue);
      const valueInCents = new BN(Math.floor(parseFloat(parsedValue) * 100));

      const tx = await program.methods
        .createLicitation(
          Array.from(editalHash),
          title,
          description,
          profile.name, // Orgao vem do perfil
          editalUri,
          valueInCents,
          commitEnd,
          revealEnd
        )
        .accounts({
          authority: publicKey,
        })
        .rpc();

      toast.success("Licitação criada on-chain!", {
        description: `TX: ${tx.slice(0, 12)}...`,
      });

      router.push(`/licitation/${licitationPda.toBase58()}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar licitação", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!publicKey) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Conecte sua carteira</h2>
        <p className="mt-2 text-gray-600">
          Apenas pregoeiros conectados podem criar licitações.
        </p>
      </div>
    );
  }

  if (loadingProfile) {
    return <div className="text-center py-20">Carregando perfil...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Perfil obrigatório</h2>
        <p className="mt-2 text-gray-600 mb-4">
          Você precisa criar um perfil antes de interagir.
        </p>
        <Link
          href="/profile"
          className="bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-md font-medium"
        >
          Criar meu Perfil
        </Link>
      </div>
    );
  }

  if (profile.role !== "Pregoeiro") {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-red-600">Acesso Negado</h2>
        <p className="mt-2 text-gray-600">
          Apenas usuários com o perfil de <strong>Pregoeiro</strong> podem criar licitações.
          <br />Seu perfil atual é <strong>{profile.role}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Nova Licitação</h1>
      <p className="text-gray-600 mb-8">
        O edital ficará registrado on-chain de forma imutável.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            required
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md px-3 py-2 h-24 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Edital (PDF) — opcional na demo
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setEditalFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            O hash SHA-256 do PDF é registrado on-chain. O PDF em si fica em IPFS.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URI do edital (IPFS)</label>
          <input
            type="text"
            required
            maxLength={200}
            value={editalUri}
            onChange={(e) => setEditalUri(e.target.value)}
            className="w-full border rounded-md px-3 py-2 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valor estimado (R$)
          </label>
          <input
            type="text"
            required
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(formatCurrencyInput(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
            placeholder="0,00"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Duração da fase de commit (s)
            </label>
            <input
              type="number"
              required
              min="10"
              value={commitDuration}
              onChange={(e) => setCommitDuration(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Duração da fase de reveal (s)
            </label>
            <input
              type="number"
              required
              min="10"
              value={revealDuration}
              onChange={(e) => setRevealDuration(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm">
          ⚠️ Valores curtos (60s/120s) facilitam a demo. Em produção, use prazos
          conforme Lei 14.133/2021.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal hover:bg-teal-dark text-white py-3 rounded-md font-medium disabled:opacity-50"
        >
          {submitting ? "Publicando…" : "Publicar Licitação On-Chain"}
        </button>
      </form>
    </div>
  );
}
