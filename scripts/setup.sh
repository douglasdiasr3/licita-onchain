#!/usr/bin/env bash
# Script de setup inicial para o hackathon
# Roda checks e instalações em ordem

set -e

echo "🔍 Verificando dependências..."

command -v rustc >/dev/null 2>&1 || { echo "❌ Rust não instalado"; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "❌ Solana CLI não instalado"; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "❌ Anchor não instalado"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js não instalado"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm não instalado"; exit 1; }

echo "✅ Todas dependências OK"

echo "🔧 Configurando Solana para devnet..."
solana config set --url devnet

echo "💰 Solicitando airdrop..."
solana airdrop 2 || echo "⚠️ Airdrop falhou (rate limit), continue"

echo "📦 Instalando dependências do programa..."
pnpm install

echo "🏗️ Building Anchor program..."
anchor build

echo "🔑 Program ID:"
anchor keys list

echo ""
echo "✅ Setup completo! Próximos passos:"
echo "  1. anchor deploy --provider.cluster devnet"
echo "  2. Copie o Program ID para Anchor.toml e app/.env.local"
echo "  3. Copie target/idl/licita_onchain.json para app/src/lib/idl.json"
echo "  4. cd app && pnpm install && pnpm dev"
