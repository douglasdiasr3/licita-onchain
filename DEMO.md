# 🎬 Roteiro de Demo — Licita OnChain

> Guia passo-a-passo para a demonstração do hackathon.
> **Tempo estimado:** 3 a 5 minutos.

---

## 🎯 Pré-requisitos da demo

Antes de iniciar:

- ✅ Programa deployado em devnet
- ✅ Program ID atualizado em todos os 3 lugares
- ✅ IDL copiado para `app/src/lib/idl.json`
- ✅ Frontend rodando (`pnpm dev`)
- ✅ **3 wallets Phantom** configuradas em devnet:
  - Wallet "Pregoeiro"
  - Wallet "Fornecedor A"
  - Wallet "Fornecedor B"
- ✅ Cada wallet com 1+ SOL de devnet (use https://faucet.solana.com)

---

## 🎤 Roteiro narrado

### Abertura (15s)

> "Hoje, no Brasil, gastamos R$ 1 trilhão por ano em compras públicas — e perdemos entre 5% e 10% disso para fraudes. O motivo? **Confiança concentrada num operador central**. Vou mostrar como a Solana resolve isso."

### Ato 1 — Pregoeiro publica o edital (45s)

1. Conecte como **Pregoeiro**
2. Vá em "+ Nova Licitação"
3. Preencha:
   - Título: `Demo Hackathon - Pregão de Notebooks`
   - Valor estimado: `500000`
   - Commit: `60` segundos
   - Reveal: `90` segundos
4. Clique "Publicar"
5. **Mostre no Solana Explorer** que o hash do edital ficou on-chain

> "O pregoeiro publicou o edital. O hash do PDF está gravado on-chain — qualquer alteração no PDF original muda o hash e é detectada automaticamente. Custo dessa transação: menos de R$ 0,01."

### Ato 2 — Fornecedor A envia proposta selada (30s)

1. Troque para wallet do **Fornecedor A**
2. Volte para a licitação
3. Em "Enviar Proposta Selada" → digite `50000`
4. Clique enviar

> "Fornecedor A enviou proposta de R$ 50.000. **Olhem o que vai pra blockchain:** apenas o hash. Nem o pregoeiro, nem eu, nem ninguém consegue ver o valor. Isso é commit-reveal."

### Ato 3 — Fornecedor B envia proposta selada (20s)

1. Troque para wallet do **Fornecedor B**
2. Em "Enviar Proposta Selada" → digite `48000`
3. Clique enviar

> "Outro fornecedor envia R$ 48.000. Igualmente lacrada. As duas propostas estão on-chain mas nenhuma é legível."

### Ato 4 — Aguarde fim do commit (15s)

> "Vamos aguardar a janela de propostas fechar... pronto, agora começa a fase de revelação."

### Ato 5 — Revelação dos hashes (45s)

1. Troque de volta para **Fornecedor A**
2. Aparecerá botão "Revelar Proposta" — clique
3. **O programa recomputa o hash** e valida que bate
4. Troque para **Fornecedor B** e revele também
5. **Mostre o painel lateral** — Fornecedor B agora aparece com troféu

> "Cada fornecedor reveló o valor + nonce. O smart contract recomputou o hash e validou. **Se alguém tentasse trapacear** trocando o valor, o hash não bateria e o programa rejeitaria automaticamente."

### Ato 6 — Homologação (30s)

1. Aguarde fim da fase de reveal
2. Troque para **Pregoeiro**
3. Clique "🏆 Homologar Vencedor"

> "O pregoeiro homologa. Vencedor: Fornecedor B com R$ 48.000. **Tudo isto está gravado para sempre na blockchain pública**, auditável por qualquer cidadão, em qualquer momento."

### Encerramento (20s)

> "Custo total dessa demo inteira: menos de 5 centavos. Em Ethereum, custaria centenas de reais. Em qualquer outro sistema, dependeríamos da honestidade de um operador central. **Em Solana, não dependemos de ninguém — a matemática garante.**"

---

## 🐛 Plano B em caso de falhas

### Se devnet estiver lenta

- Pré-grave a demo em vídeo
- Tenha screenshots de cada passo prontos
- Use modo localnet com `solana-test-validator`

### Se a wallet não conectar

- Limpe o cache do Phantom
- Use modo "Adicionar conta de hardware" + "Importar chave privada"
- Tenha um fallback com wallets já importadas

### Se ocorrer erro de IDL

```bash
anchor build
./scripts/sync-idl.sh
# Reinicie o Next.js
```

### Se Phantom estiver na mainnet por engano

Configure: Phantom → Settings → Developer Settings → Testnet Mode → Devnet

---

## 📊 Métricas para destacar no pitch

| Métrica | Valor |
|---|---|
| Custo por transação | < R$ 0,01 |
| Tempo de confirmação | < 1 segundo |
| Custo total da demo | ~R$ 0,05 |
| Equivalente em Ethereum | R$ 200–2.000 |
| Linhas de código do contract | ~250 |
| Validação de hash | 100% on-chain |

---

## 🎬 Vídeo backup

Recomendamos gravar um vídeo de 3 minutos como backup:

```bash
# macOS
brew install --cask obs
# Linux
sudo apt install obs-studio
```

Roteiro do vídeo: mesmo do roteiro acima. Dica: **acelere 1.5x na edição** para ficar dinâmico.
