"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useProgram, deriveProposalPda } from "@/lib/anchor";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import {
  computeCommitHash,
  generateNonce,
  saveProposalSecret,
  loadProposalSecret,
  bytesToHex,
} from "@/lib/crypto";
import {
  formatBRL,
  formatDateTime,
  secondsUntil,
  shortenAddress,
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/lib/format";
import BN from "bn.js";
import { toast } from "sonner";
import { Lock, Unlock, Trophy, ExternalLink } from "lucide-react";

export default function LicitationDetailPage({
  params,
}: {
  params: { address: string };
}) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const { profile } = useProfile();
  const [licitation, setLicitation] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [refreshKey, setRefreshKey] = useState(0);

  // Tick a cada segundo pra atualizar contadores
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Polling a cada 5 segundos para emular realtime sem Supabase
  useEffect(() => {
    const id = setInterval(() => setRefreshKey((k) => k + 1), 5000);
    return () => clearInterval(id);
  }, []);

  // Carrega licitação e propostas
  useEffect(() => {
    if (!program) return;

    (async () => {
      try {
        const licPubkey = new PublicKey(params.address);
        const lic = await program.account.licitation.fetch(licPubkey);
        setLicitation(lic);

        // Busca todas propostas dessa licitação
        const allProps = await program.account.proposal.all([
          {
            memcmp: {
              offset: 8, // após o discriminator
              bytes: licPubkey.toBase58(),
            },
          },
        ]);
        setProposals(allProps);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [program, params.address, refreshKey]);

  if (!program) {
    return (
      <div className="text-center py-20">
        <p>Conecte sua carteira para visualizar detalhes.</p>
      </div>
    );
  }

  if (!licitation) {
    return <div className="text-center py-20">Carregando…</div>;
  }

  const inCommit = now < licitation.commitPhaseEnd.toNumber();
  const inReveal =
    now >= licitation.commitPhaseEnd.toNumber() &&
    now < licitation.revealPhaseEnd.toNumber();
  const finished = now >= licitation.revealPhaseEnd.toNumber();
  const status = Object.keys(licitation.status)[0];

  const myProposal = publicKey
    ? proposals.find((p) => p.account.bidder.toBase58() === publicKey.toBase58())
    : null;

  const isAuthority =
    publicKey?.toBase58() === licitation.authority.toBase58();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Coluna principal */}
      <div className="lg:col-span-2 space-y-6">
        <div className="break-words min-w-0">
          <PhaseBadge inCommit={inCommit} inReveal={inReveal} status={status} />
          <h1 className="text-3xl font-bold mt-2 break-words">{licitation.title}</h1>
          <div className="mt-4">
            <span className="text-sm text-gray-500 font-medium">Órgão Promotor:</span>
            <div className="text-lg font-semibold">{licitation.orgao}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <strong>Pregoeiro (Carteira):</strong> {shortenAddress(licitation.authority.toBase58())}
          </div>
          {licitation.description && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-md">
              <span className="block text-sm font-medium text-gray-500 mb-1">Descrição:</span>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{licitation.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Valor estimado</div>
            <div className="text-2xl font-bold">
              {formatBRL(licitation.estimatedValue.toString())}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Fim da fase de COMMIT</div>
              <div className="font-medium">
                {formatDateTime(licitation.commitPhaseEnd)}
              </div>
              {inCommit && (
                <div className="text-teal-dark text-xs mt-1">
                  ⏱ {secondsUntil(licitation.commitPhaseEnd.toNumber())}s restantes
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-500">Fim da fase de REVEAL</div>
              <div className="font-medium">
                {formatDateTime(licitation.revealPhaseEnd)}
              </div>
              {inReveal && (
                <div className="text-amber-700 text-xs mt-1">
                  ⏱ {secondsUntil(licitation.revealPhaseEnd.toNumber())}s restantes
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t overflow-hidden">
            <div className="text-sm text-gray-500">Edital</div>
            <a
              href={licitation.editalUri.replace("ipfs://", "https://dweb.link/ipfs/")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-dark hover:underline text-sm flex items-start sm:items-center gap-1 mt-1"
            >
              <span className="break-all">{licitation.editalUri}</span>
              <ExternalLink className="size-3 flex-shrink-0 mt-1 sm:mt-0" />
            </a>
            <div className="text-xs text-gray-500 mt-2 font-mono break-all">
              SHA-256: {bytesToHex(new Uint8Array(licitation.editalHash))}
            </div>
          </div>
        </div>

        {/* Ações para fornecedor */}
        {!isAuthority && (
          <div>
            {!profile ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-amber-900">Perfil obrigatório</h3>
                <p className="text-sm text-amber-800 mt-1 mb-4">
                  Você precisa criar um perfil antes de dar lances.
                </p>
                <Link
                  href="/profile"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium text-sm inline-block"
                >
                  Criar meu Perfil
                </Link>
              </div>
            ) : profile.role !== "Fornecedor" ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-red-900">Acesso Negado</h3>
                <p className="text-sm text-red-800 mt-1">
                  Apenas usuários com o perfil de <strong>Fornecedor</strong> podem enviar propostas. Seu perfil é <strong>{profile.role}</strong>.
                </p>
              </div>
            ) : (
              <>
                {inCommit && !myProposal && (
                  <CommitForm
                    licitationAddress={params.address}
                    onSuccess={() => setRefreshKey((k) => k + 1)}
                  />
                )}
                {inReveal && myProposal && Object.keys(myProposal.account.status)[0] === "committed" && (
                  <RevealForm
                    licitationAddress={params.address}
                    onSuccess={() => setRefreshKey((k) => k + 1)}
                  />
                )}
                {myProposal && Object.keys(myProposal.account.status)[0] === "revealed" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <Unlock className="mx-auto size-8 text-green-600 mb-2" />
                    <h3 className="font-semibold">Sua proposta foi revelada!</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Valor: {formatBRL(myProposal.account.revealedValue.toString())}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Ações para pregoeiro */}
        {isAuthority && finished && status === "open" && (
          <HomologateButton
            licitationAddress={params.address}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </div>

      {/* Coluna lateral — propostas */}
      <div>
        <h2 className="font-semibold mb-3">
          Propostas ({proposals.length})
        </h2>
        <div className="space-y-2">
          {proposals.length === 0 && (
            <p className="text-sm text-gray-500">Nenhuma proposta ainda.</p>
          )}
          {proposals
            .sort((a, b) => {
              const aRev = a.account.revealedValue?.toNumber() ?? Infinity;
              const bRev = b.account.revealedValue?.toNumber() ?? Infinity;
              return aRev - bRev;
            })
            .map((p, i) => (
              <ProposalCard
                key={p.publicKey.toBase58()}
                proposal={p}
                rank={i + 1}
                isWinner={
                  status === "homologated" &&
                  licitation.winner?.toBase58() === p.account.bidder.toBase58()
                }
                isHomologated={status === "homologated"}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//                       SUBCOMPONENTES
// ============================================================

function PhaseBadge({
  inCommit,
  inReveal,
  status,
}: {
  inCommit: boolean;
  inReveal: boolean;
  status: string;
}) {
  if (status === "homologated")
    return <Badge color="green" icon={<Trophy className="size-3" />}>Homologada</Badge>;
  if (inCommit)
    return <Badge color="teal" icon={<Lock className="size-3" />}>Fase de COMMIT</Badge>;
  if (inReveal)
    return <Badge color="amber" icon={<Unlock className="size-3" />}>Fase de REVEAL</Badge>;
  return <Badge color="gray">Encerrada</Badge>;
}

function Badge({
  color,
  icon,
  children,
}: {
  color: "teal" | "amber" | "green" | "gray";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles = {
    teal: "bg-teal/20 text-teal-dark",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${styles[color]}`}
    >
      {icon}
      {children}
    </span>
  );
}

function CommitForm({
  licitationAddress,
  onSuccess,
}: {
  licitationAddress: string;
  onSuccess: () => void;
}) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !program) return;

    setLoading(true);
    try {
      const parsedValue = parseCurrencyInput(value);
      const valueInCents = new BN(Math.floor(parseFloat(parsedValue) * 100));
      const nonce = generateNonce();
      const commitHash = computeCommitHash(valueInCents, nonce, publicKey);

      const licitationPubkey = new PublicKey(licitationAddress);
      const [proposalPda] = deriveProposalPda(licitationPubkey, publicKey);

      await program.methods
        .commitProposal(Array.from(commitHash))
        .accounts({
          licitation: licitationPubkey,
          bidder: publicKey,
        })
        .rpc();

      // Salva nonce + valor pra recuperar no reveal
      saveProposalSecret(
        licitationAddress,
        publicKey.toBase58(),
        valueInCents,
        nonce
      );

      toast.success("Proposta selada on-chain! 🔒");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar proposta", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-lg p-6 space-y-4"
    >
      <h3 className="font-semibold flex items-center gap-2">
        <Lock className="size-4" /> Enviar Proposta Selada
      </h3>
      <div>
        <label className="block text-sm font-medium mb-1">Valor (R$)</label>
        <input
          type="text"
          required
          value={value}
          onChange={(e) => setValue(formatCurrencyInput(e.target.value))}
          className="w-full border rounded-md px-3 py-2"
          placeholder="0,00"
        />
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs">
        Sua proposta será lacrada com keccak256. Ninguém — nem o pregoeiro —
        verá o valor antes da fase de revelação.
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal hover:bg-teal-dark text-white py-2 rounded-md font-medium disabled:opacity-50"
      >
        {loading ? "Selando…" : "Enviar Proposta Selada"}
      </button>
    </form>
  );
}

function RevealForm({
  licitationAddress,
  onSuccess,
}: {
  licitationAddress: string;
  onSuccess: () => void;
}) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const secret = publicKey
    ? loadProposalSecret(licitationAddress, publicKey.toBase58())
    : null;

  async function handleReveal() {
    if (!publicKey || !program || !secret) return;

    setLoading(true);
    try {
      const licitationPubkey = new PublicKey(licitationAddress);
      const [proposalPda] = deriveProposalPda(licitationPubkey, publicKey);

      await program.methods
        .revealProposal(secret.value, Array.from(secret.nonce))
        .accounts({
          licitation: licitationPubkey,
        })
        .rpc();

      toast.success("Proposta revelada e validada! ✅");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao revelar", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (!secret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-red-900">Segredo não encontrado</h3>
        <p className="text-sm text-red-700 mt-1">
          Você precisa estar no mesmo navegador onde fez o commit, ou ter
          guardado o nonce manualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Unlock className="size-4" /> Revelar Proposta
      </h3>
      <div className="text-sm">
        Sua proposta:{" "}
        <strong className="text-lg">{formatBRL(secret.value.toString())}</strong>
      </div>
      <button
        onClick={handleReveal}
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md font-medium disabled:opacity-50"
      >
        {loading ? "Revelando…" : "Revelar e Validar Hash"}
      </button>
    </div>
  );
}

function HomologateButton({
  licitationAddress,
  onSuccess,
}: {
  licitationAddress: string;
  onSuccess: () => void;
}) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  async function handleHomologate() {
    if (!publicKey || !program) return;
    setLoading(true);
    try {
      await program.methods
        .homologate()
        .accounts({
          licitation: new PublicKey(licitationAddress),
          authority: publicKey,
        })
        .rpc();
      toast.success("Licitação homologada! 🏆");
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao homologar", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleHomologate}
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
    >
      {loading ? "Homologando…" : "🏆 Homologar Vencedor"}
    </button>
  );
}

function ProposalCard({
  proposal,
  rank,
  isWinner,
  isHomologated,
}: {
  proposal: any;
  rank: number;
  isWinner: boolean;
  isHomologated: boolean;
}) {
  const status = Object.keys(proposal.account.status)[0];
  const value = proposal.account.revealedValue;
  const bidder = proposal.account.bidder.toBase58();

  return (
    <div
      className={`border rounded-lg p-3 ${
        isWinner ? "bg-green-50 border-green-300" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between text-sm">
        {isHomologated ? (
          <BidderName bidderPubkey={bidder} />
        ) : (
          <span className="font-mono text-xs">{shortenAddress(bidder)}</span>
        )}
        {isWinner && <Trophy className="size-4 text-green-600" />}
      </div>
      <div className="mt-1">
        {status === "committed" ? (
          <span className="text-gray-500 italic text-sm">🔒 Selada</span>
        ) : (
          <span className="text-lg font-bold">
            {formatBRL(value.toString())}
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">#{rank}</div>
    </div>
  );
}

function BidderName({ bidderPubkey }: { bidderPubkey: string }) {
  const program = useProgram();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!program) return;
    (async () => {
      try {
        const pk = new PublicKey(bidderPubkey);
        const [profilePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("profile"), pk.toBuffer()],
          program.programId
        );
        const profile = await program.account.userProfile.fetch(profilePda);
        setName(profile.name);
      } catch {
        setName(null);
      }
    })();
  }, [program, bidderPubkey]);

  if (name) {
    return <span className="font-semibold text-gray-800">{name}</span>;
  }
  return <span className="font-mono text-xs">{shortenAddress(bidderPubkey)}</span>;
}
