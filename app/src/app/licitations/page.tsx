"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgram } from "@/lib/anchor";
import { formatBRL, formatDateTime, shortenAddress } from "@/lib/format";
import { FileText, Clock, CheckCircle2 } from "lucide-react";

interface LicitationView {
  address: string;
  title: string;
  description: string;
  orgao: string;
  estimatedValue: string;
  proposalCount: number;
  status: string;
  commitPhaseEnd: number;
  revealPhaseEnd: number;
  authority: string;
}

export default function LicitationsPage() {
  const program = useProgram();
  const [licitations, setLicitations] = useState<LicitationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await program.account.licitation.all();
        const mapped = all.map((item: any) => ({
          address: item.publicKey.toBase58(),
          title: item.account.title,
          description: item.account.description,
          orgao: item.account.orgao,
          estimatedValue: item.account.estimatedValue.toString(),
          proposalCount: item.account.proposalCount,
          status: Object.keys(item.account.status)[0],
          commitPhaseEnd: item.account.commitPhaseEnd.toNumber(),
          revealPhaseEnd: item.account.revealPhaseEnd.toNumber(),
          authority: item.account.authority.toBase58(),
        }));
        setLicitations(
          mapped.sort((a, b) => b.commitPhaseEnd - a.commitPhaseEnd)
        );
      } catch (err) {
        console.error("Erro ao carregar licitações:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [program]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Licitações Públicas</h1>
          <p className="text-gray-600 mt-1">
            Transparentes · Imutáveis · Auditáveis em tempo real
          </p>
        </div>
        <Link
          href="/new"
          className="bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Nova Licitação
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Carregando…</div>
      ) : licitations.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto size-12 text-gray-400" />
          <h2 className="mt-4 font-semibold">Nenhuma licitação publicada</h2>
          <p className="mt-1 text-sm text-gray-600">
            Seja o primeiro a publicar um edital on-chain.
          </p>
          <Link
            href="/new"
            className="inline-block mt-4 text-teal-dark underline text-sm"
          >
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {licitations.map((lic) => (
            <LicitationCard key={lic.address} licitation={lic} />
          ))}
        </div>
      )}
    </div>
  );
}

function LicitationCard({ licitation }: { licitation: LicitationView }) {
  const now = Math.floor(Date.now() / 1000);
  const inCommit = now < licitation.commitPhaseEnd;
  const inReveal =
    now >= licitation.commitPhaseEnd && now < licitation.revealPhaseEnd;

  let phase = "Encerrada";
  let phaseColor = "bg-gray-100 text-gray-700";
  if (inCommit) {
    phase = "Aberta para propostas";
    phaseColor = "bg-teal/20 text-teal-dark";
  } else if (inReveal) {
    phase = "Revelação aberta";
    phaseColor = "bg-amber-100 text-amber-800";
  } else if (licitation.status === "homologated") {
    phase = "Homologada";
    phaseColor = "bg-green-100 text-green-800";
  }

  return (
    <Link
      href={`/licitation/${licitation.address}`}
      className="block bg-white border rounded-lg p-5 hover:border-teal transition"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded ${phaseColor}`}>
              {phase}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="size-3" />
              Encerra: {formatDateTime(licitation.revealPhaseEnd)}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{licitation.title}</h3>
          <div className="text-sm font-medium text-gray-700 mt-1">{licitation.orgao}</div>
          {licitation.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{licitation.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span>
              Valor estimado:{" "}
              <strong className="text-navy">
                {formatBRL(licitation.estimatedValue)}
              </strong>
            </span>
            <span>{licitation.proposalCount} proposta(s)</span>
            <span>Pregoeiro: {shortenAddress(licitation.authority)}</span>
          </div>
        </div>
        {licitation.status === "homologated" && (
          <CheckCircle2 className="size-6 text-green-600" />
        )}
      </div>
    </Link>
  );
}
