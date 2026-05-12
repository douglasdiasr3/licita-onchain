# 🚀 Quickstart — Licita OnChain

Guia rápido para colocar o projeto rodando do zero.

## 1️⃣ Clone e instale

```bash
git clone <seu-repo>
cd licita-onchain
pnpm install
```

## 2️⃣ Configure Solana

```bash
solana-keygen new -o ~/.config/solana/id.json  # se ainda não tem
solana config set --url devnet
solana airdrop 2
solana balance  # deve mostrar 2 SOL
```

## 3️⃣ Build do programa

```bash
anchor build
```

Isso cria:
- `target/deploy/licita_onchain.so` — bytecode do programa
- `target/idl/licita_onchain.json` — IDL (interface)

## 4️⃣ Deploy em devnet

```bash
anchor deploy --provider.cluster devnet
```

Vai mostrar algo como:
```
Program Id: ABc123...XyZ789
```

**📋 Anote este Program ID — você vai usar em 3 lugares.**

## 5️⃣ Atualize Program IDs

Abra estes arquivos e cole o Program ID novo:

### `Anchor.toml`
```toml
[programs.devnet]
licita_onchain = "ABc123...XyZ789"
```

### `programs/licita-onchain/src/lib.rs` (linha 4)
```rust
declare_id!("ABc123...XyZ789");
```

### `app/.env.local` (criar a partir de `.env.example`)
```env
NEXT_PUBLIC_PROGRAM_ID=ABc123...XyZ789
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

Agora rebuild para fixar o Program ID no bytecode:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

## 6️⃣ Sincronize o IDL

```bash
./scripts/sync-idl.sh
```

Isso copia `target/idl/licita_onchain.json` para `app/src/lib/idl.json`.

## 7️⃣ Rode os testes (opcional mas recomendado)

```bash
anchor test
```

Você deve ver todos os testes passando ✅:
- pregoeiro cria a licitação
- fornecedor A envia proposta selada
- fornecedor B envia proposta selada
- aguarda fim da fase de commit
- fornecedor A revela proposta
- fornecedor B revela proposta menor → assume liderança
- rejeita reveal com nonce errado

## 8️⃣ Rode o frontend

```bash
cd app
pnpm dev
```

Abra http://localhost:3000

## 9️⃣ Conecte Phantom em devnet

1. Instale Phantom: https://phantom.app
2. Settings → Developer Settings → Testnet Mode → **Devnet**
3. Receba SOL: https://faucet.solana.com (ou `solana airdrop` no CLI)
4. Conecte na sua app

## 🔟 Próximos passos

- 📖 Leia `DEMO.md` para o roteiro do pitch
- 🧪 Crie wallets adicionais para simular fornecedores
- 🎨 Customize as cores em `app/tailwind.config.js`
- 📦 Adicione o Supabase: `supabase init && supabase start`

---

## 🛠️ Comandos úteis

```bash
# Logs do programa em tempo real
solana logs

# Inspecionar account on-chain
solana account <ADDRESS>

# Limpar tudo e recomeçar
anchor clean && rm -rf node_modules app/node_modules
```

## 🆘 Problemas comuns

### "Program ID mismatch"
→ Você esqueceu de rebuildar após mudar o `declare_id!`. Rode `anchor build` de novo.

### "Account does not exist"
→ A licitação não foi criada ainda, ou você está no cluster errado. Verifique `solana config get`.

### "Transaction simulation failed: insufficient lamports"
→ Sua wallet está sem SOL. Rode `solana airdrop 2`.

### IDL retorna instruções vazias
→ `app/src/lib/idl.json` é o placeholder. Rode `./scripts/sync-idl.sh`.

### Hash mismatch na revelação
→ Diferença de bytes entre Rust e TS. Verifique se está usando keccak256 (não sha256) e ordem `value || nonce || bidder`.
