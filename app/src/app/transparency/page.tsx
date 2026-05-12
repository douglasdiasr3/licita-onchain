"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgram } from "@/lib/anchor";
import { formatBRL, formatDateTime, shortenAddress } from "@/lib/format";
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

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

export default function TransparencyPage() {
  const program = useProgram();
  const [licitations, setLicitations] = useState<LicitationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await program.account.licitation.all();
        const mapped = all
          .filter((item: any) => Object.keys(item.account.status)[0] === "homologated")
          .map((item: any) => ({
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
        
        // Ordena da mais recente homologada (aqui não temos data de homologação salva facilmente na view,
        // então ordenamos pelo término da fase de reveal).
        setLicitations(mapped.sort((a, b) => b.revealPhaseEnd - a.revealPhaseEnd));
      } catch (err) {
        console.error("Erro ao carregar licitações:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [program]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-8 text-green-600" /> Portal de Transparência
          </h1>
          <p className="text-gray-600 mt-2">
            Acesso público e irrestrito aos editais homologados e vencedores da blockchain.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Buscando registros on-chain…</div>
      ) : licitations.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-gray-50">
          <CheckCircle2 className="mx-auto size-12 text-gray-300" />
          <h2 className="mt-4 font-semibold text-gray-700">Nenhuma licitação homologada ainda</h2>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe a página principal para ver os editais em andamento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {licitations.map((lic) => (
            <HomologatedCard key={lic.address} licitation={lic} />
          ))}
        </div>
      )}
    </div>
  );
}

function HomologatedCard({ licitation }: { licitation: LicitationView }) {
  return (
    <Link
      href={`/licitation/${licitation.address}`}
      className="block bg-white border border-green-200 rounded-lg p-5 hover:border-green-400 hover:shadow-sm transition"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Homologada
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
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> Encerrada em: {formatDateTime(licitation.revealPhaseEnd)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
