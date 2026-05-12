#!/usr/bin/env bash
# Copia o IDL gerado para o frontend após cada build

set -e

IDL_SRC="target/idl/licita_onchain.json"
IDL_DEST="app/src/lib/idl.json"

if [ ! -f "$IDL_SRC" ]; then
  echo "❌ IDL não encontrado em $IDL_SRC"
  echo "Rode 'anchor build' primeiro"
  exit 1
fi

cp "$IDL_SRC" "$IDL_DEST"
echo "✅ IDL copiado: $IDL_SRC → $IDL_DEST"

# Mostra Program ID atual
PROGRAM_ID=$(anchor keys list 2>/dev/null | grep -oP '(?<=licita_onchain: )\S+' || echo "?")
echo "📋 Program ID: $PROGRAM_ID"
echo ""
echo "Lembre de garantir que o Program ID está correto em:"
echo "  - Anchor.toml (programs.localnet e programs.devnet)"
echo "  - programs/licita-onchain/src/lib.rs (declare_id!)"
echo "  - app/.env.local (NEXT_PUBLIC_PROGRAM_ID)"
