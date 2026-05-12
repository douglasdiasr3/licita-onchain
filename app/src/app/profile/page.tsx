"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/lib/anchor";
import { toast } from "sonner";
import { UserCircle, Edit2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { shortenAddress } from "@/lib/format";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const { profile, loading: loadingProfile } = useProfile();

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [role, setRole] = useState<"Pregoeiro" | "Fornecedor">("Pregoeiro");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile && !isEditing) {
      setName(profile.name);
      setDocument(profile.document);
      setRole(profile.role);
    }
  }, [profile, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !program) {
      toast.error("Conecte sua carteira primeiro");
      return;
    }

    setSubmitting(true);
    try {
      const enumRole =
        role === "Pregoeiro" ? { pregoeiro: {} } : { fornecedor: {} };

      const tx = await program.methods
        .createProfile(name, document, enumRole as any)
        .accounts({
          authority: publicKey,
        })
        .rpc();

      toast.success("Perfil salvo na blockchain!", {
        description: `TX: ${tx.slice(0, 12)}...`,
      });
      setIsEditing(false);
      // Recarregamos a página para forçar a atualização global ou apenas deixamos o hook pegar (requer refetch manual ou recarregar)
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar perfil", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!publicKey) {
    return (
      <div className="text-center py-20">
        <UserCircle className="mx-auto size-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">Conecte sua carteira</h2>
        <p className="mt-2 text-gray-600">
          Você precisa estar conectado para acessar seu perfil.
        </p>
      </div>
    );
  }

  if (loadingProfile) {
    return <div className="text-center py-10">Carregando perfil...</div>;
  }

  const showForm = !profile || isEditing;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Meu Perfil On-chain</h1>
        {profile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-teal hover:underline text-sm font-medium"
          >
            <Edit2 className="size-4" /> Editar
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-8">
        Preencha seus dados para que apareçam publicamente nas licitações em vez
        de exibir apenas o endereço da sua carteira.
      </p>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome / Razão Social
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Ex: Prefeitura Municipal de Tech"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Documento (CPF/CNPJ)
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Ex: 00.000.000/0001-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de Usuário
            </label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Pregoeiro"
                  checked={role === "Pregoeiro"}
                  onChange={() => setRole("Pregoeiro")}
                />
                Pregoeiro (Órgão Público)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Fornecedor"
                  checked={role === "Fornecedor"}
                  onChange={() => setRole("Fornecedor")}
                />
                Fornecedor (Empresa)
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-teal hover:bg-teal-dark text-white py-3 rounded-md font-medium disabled:opacity-50"
            >
              {submitting ? "Gravando na Solana…" : "Salvar Perfil On-chain"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border rounded-md font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 break-words">
            <div>
              <div className="text-sm text-gray-500 mb-1">Nome / Razão Social</div>
              <div className="font-semibold text-lg">{profile.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Documento</div>
              <div className="font-semibold">{profile.document}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Tipo de Usuário</div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                {profile.role}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Carteira</div>
              <div className="font-mono text-sm">{shortenAddress(profile.authority)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
