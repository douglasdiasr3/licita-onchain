"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy to-gray-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Elementos visuais de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Licitações Públicas <br/><span className="text-teal">Transparentes e Imutáveis</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl">
            Licita OnChain é o futuro das compras governamentais. Utilizando a segurança da rede Solana e o sigilo matemático do protocolo <em>Commit-Reveal</em>, garantimos pregões justos, à prova de fraudes e 100% auditáveis.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/licitations"
              className="bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-md font-semibold transition shadow-lg"
            >
              Participar de Licitações
            </Link>
            <Link
              href="/new"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md font-semibold backdrop-blur-sm transition border border-white/20"
            >
              Criar Licitação
            </Link>
            <Link href="/transparency" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-md font-semibold backdrop-blur-sm transition border border-white/20 flex items-center gap-2">
              <ShieldCheck className="size-5" /> Portal de Transparência
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Imutabilidade</h3>
          <p className="text-gray-600 text-sm">
            Todas as regras, editais e lances ficam gravados na blockchain. É matematicamente impossível alterar o passado ou manipular resultados para favorecer fornecedores.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <div className="size-12 bg-teal/10 text-teal-dark rounded-lg flex items-center justify-center mb-4">
            <Lock className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Sigilo Garantido</h3>
          <p className="text-gray-600 text-sm">
            O modelo Commit-Reveal usa hashes criptográficos de ponta a ponta. Seu lance permanece em segredo absoluto na rede até o fechamento da fase de propostas.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <div className="size-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Alta Performance</h3>
          <p className="text-gray-600 text-sm">
            Construído na blockchain Solana, a execução dos contratos inteligentes e o envio de propostas acontecem em milissegundos, com um custo de transação quase nulo.
          </p>
        </div>
      </section>
    </div>
  );
}
