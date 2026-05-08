# Licita OnChain

Sistema de licitações públicas transparentes, imutáveis e auditáveis utilizando Solana.

**Equipe:** Douglas Dias Reis e Daniella Cristina Rodrigues
**Hackathon:** Hackathon Solana - BH Onchain

---

## 📋 Problema que Resolve

O Brasil gasta cerca de **R$ 1 trilhão por ano** em compras públicas. Estimativas do TCU apontam que entre 5% e 10% desse valor é perdido em fraude, conluio e ineficiência.

O motivo raiz é simples: **a integridade das licitações depende de um operador central que pode ser corrompido, falhar ou reescrever o histórico** — e quando isso acontece, ninguém consegue provar nada em tempo hábil.

Os principais sintomas:
- Propostas de fornecedores vazadas para concorrentes
- Sistema "cai" na hora do lance, sem como comprovar
- Atas e documentos adulterados após o fato
- Fornecedores aguardam até 180 dias para receber pagamento
- Auditorias chegam anos depois, quando o dinheiro já sumiu

---

## 💡 Como a Solução Funciona

Fluxo lógico da plataforma:

```
Órgão público cria edital
→ documento vira um cNFT imutável na Solana
→ fornecedores enviam proposta como hash criptográfico (commit)
→ ninguém consegue ver o valor antes da hora
→ no horário marcado, todos revelam as propostas simultaneamente (reveal)
→ smart contract valida os hashes automaticamente
→ disputa de lances acontece em tempo real, cada lance gravado on-chain
→ vencedor é homologado e contrato vira cNFT
→ pagamento fica bloqueado em escrow programático
→ valor é liberado automaticamente após atestado de entrega
→ qualquer cidadão pode auditar todo o histórico em tempo real
```

---

## 🗺️ Jornada do Usuário

### Fornecedor (PME)

1. Acessa a plataforma e conecta a Phantom Wallet
2. Consulta editais abertos e baixa documentos
3. Envia proposta selada (apenas o hash vai on-chain)
4. Na hora da revelação, confirma o valor real via wallet
5. Participa da disputa de lances ao vivo
6. Se vencedor, assina o contrato digitalmente via wallet
7. Entrega o produto/serviço e recebe pagamento automático via escrow

### Pregoeiro (Órgão Público)

1. Acessa o painel do órgão e conecta a wallet institucional
2. Cria o edital e faz upload do PDF — hash registrado on-chain
3. Acompanha o recebimento de propostas (sem ver os valores)
4. Abre a fase de revelação no horário marcado
5. Conduz a disputa de lances
6. Homologa o vencedor — decisão registrada e imutável
7. Atesta a entrega — pagamento liberado automaticamente

### Auditor / Cidadão

1. Acessa o portal público (sem necessidade de cadastro ou wallet)
2. Pesquisa qualquer licitação por órgão, data ou valor
3. Visualiza todo o histórico de lances, propostas e documentos
4. Valida hashes dos documentos localmente
5. Exporta dados para análise

---

## 🖼️ Esboço de Telas (Wireframe)

### Tela 1 — Portal Público (Home)
```
┌─────────────────────────────────────────────┐
│  🔗 Licita OnChain          [Conectar Wallet]│
├─────────────────────────────────────────────┤
│                                             │
│   Buscar licitação: [________________] 🔍   │
│                                             │
│   Filtros: [Órgão ▼]  [Status ▼]  [Data ▼] │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ 📄 Pregão 001/2025 — Prefeitura BH  │   │
│   │ Notebooks  •  R$ 500.000  •  Aberto │   │
│   │ Encerra em: 2 dias                  │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ 📄 Pregão 002/2025 — Gov. MG        │   │
│   │ Mobiliário  •  R$ 1.200.000  •  ...  │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Tela 2 — Envio de Proposta (Fornecedor)
```
┌─────────────────────────────────────────────┐
│  Pregão 001/2025 — Enviar Proposta          │
├─────────────────────────────────────────────┤
│                                             │
│  Valor da proposta: R$ [_______________]    │
│                                             │
│  Documentos de habilitação:                 │
│  [📎 Anexar CND Federal    ✅ Enviado]       │
│  [📎 Anexar Balanço        ⬜ Pendente]      │
│                                             │
│  ⚠️ Sua proposta será lacrada               │
│  criptograficamente. Ninguém poderá         │
│  ver o valor antes da revelação.            │
│                                             │
│  [    ENVIAR PROPOSTA SELADA    ]           │
│                                             │
└─────────────────────────────────────────────┘
```

### Tela 3 — Disputa de Lances (Ao Vivo)
```
┌─────────────────────────────────────────────┐
│  🔴 DISPUTA AO VIVO — Pregão 001/2025       │
├─────────────────────────────────────────────┤
│                                             │
│  Melhor lance atual:  R$ 487.000            │
│  Fornecedor:          0x3f...a9 (anônimo)   │
│  Tempo restante:      04:32                 │
│                                             │
│  Histórico:                                 │
│  14:03:21  R$ 487.000  0x3f...a9 ✅ on-chain│
│  14:02:58  R$ 492.000  0x7c...b2 ✅ on-chain│
│  14:02:10  R$ 498.500  0x1a...e5 ✅ on-chain│
│                                             │
│  Seu lance: R$ [__________]                 │
│  [       ENVIAR LANCE       ]               │
└─────────────────────────────────────────────┘
```

### Tela 4 — Confirmação / Comprovante
```
┌─────────────────────────────────────────────┐
│  ✅ Lance registrado na Solana!             │
├─────────────────────────────────────────────┤
│                                             │
│  Transação: 5Kj...mP2                       │
│  Valor:     R$ 487.000                      │
│  Horário:   14:03:21                        │
│  Status:    Confirmado                      │
│                                             │
│  [🔗 Ver no Solana Explorer]                │
│  [📥 Baixar Comprovante]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ⚡ Diferencial Blockchain — Por que Solana?

A Solana foi escolhida por resolver exatamente os gargalos de uma plataforma de licitações em escala nacional:

| Pilar | Como se aplica no Licita OnChain |
|---|---|
| ⚡ **Velocidade** | Confirmação de cada lance em ~400ms — disputa em tempo real como um site comum |
| 💸 **Baixo custo** | Menos de R$ 0,01 por transação — inviável em Ethereum (R$ 50+ por tx) |
| 🔒 **Segurança** | Commit-reveal criptográfico torna matematicamente impossível vazar propostas |
| 📜 **Imutabilidade** | Nenhum operador, nem o próprio governo, pode editar o histórico após registrado |
| 🌐 **Transparência** | Qualquer cidadão audita qualquer licitação em tempo real, sem pedir autorização |
| 🗜️ **Compressed NFTs** | Milhões de documentos públicos registrados como cNFTs por frações de centavo |

> **"Em Solana, o estado das licitações deixa de ser uma promessa do governo e passa a ser um fato matemático."**

---

## 🏗️ Arquitetura Resumida

```
Frontend (Next.js)
    └── Wallet Adapter (Phantom / Solflare)
            └── Programs Solana (Anchor / Rust)
                    ├── licitation_program  → ciclo de vida do edital
                    ├── bidding_program     → commit-reveal de propostas
                    ├── escrow_program      → pagamento por marcos
                    └── cnft_program        → documentos imutáveis (Bubblegum)
                            └── IPFS / Arweave → arquivos PDF originais
```

---

## 🛠️ Stack Tecnológica

- **Blockchain:** Solana (Devnet → Mainnet)
- **Smart Contracts:** Rust + Anchor Framework
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Wallet:** Phantom / Solflare via Wallet Adapter
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Storage:** IPFS (Pinata) + Arweave
- **NFTs:** Metaplex Bubblegum (Compressed NFTs)

### Por que Supabase?

O Supabase complementa a Solana cuidando do que **não precisa ir on-chain**, mas precisa de persistência rápida e consultas relacionais:

| Recurso Supabase | Uso no Licita OnChain |
|---|---|
| **PostgreSQL** | Indexação de eventos on-chain para buscas rápidas (por órgão, data, valor) |
| **Realtime** | Atualização ao vivo do placar de lances no dashboard sem polling |
| **Auth** | Login de fornecedores e pregoeiros vinculado à wallet (SIWS) |
| **Storage** | Upload temporário de documentos antes de enviar para IPFS/Arweave |
| **Edge Functions** | Geração automática de atas em PDF após homologação |

---

## 📜 Conformidade Legal

O projeto foi desenhado respeitando a **Lei 14.133/2021** (Nova Lei de Licitações), com suporte inicial à modalidade de **Pregão Eletrônico por menor preço** — a mais comum no país.

---

## 👥 Público-Alvo

| Usuário | Benefício principal |
|---|---|
| Fornecedor PME | Proposta protegida + pagamento garantido por escrow |
| Pregoeiro | Blindagem jurídica com histórico imutável |
| TCU / CGU / MPF | Auditoria contínua em tempo real via API pública |
| Cidadão / Imprensa | Transparência total sem depender da LAI |
