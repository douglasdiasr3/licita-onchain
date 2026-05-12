-- ============================================================
--          LICITA ONCHAIN — Schema MVP do Supabase
-- ============================================================
-- Tabelas off-chain para indexar eventos da Solana e dar UX
-- rápida de busca/listagem. Os dados aqui são derivados —
-- a fonte de verdade está sempre on-chain.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============ LICITATIONS (espelho on-chain) ============
create table public.licitations (
  on_chain_address text primary key,
  authority_wallet text not null,
  title text not null,
  edital_hash text not null,
  edital_uri text not null,
  estimated_value_cents bigint not null,
  commit_phase_end timestamptz not null,
  reveal_phase_end timestamptz not null,
  status text not null default 'open' check (status in ('open', 'homologated', 'cancelled')),
  proposal_count int not null default 0,
  winner_wallet text,
  winning_value_cents bigint,
  homologated_at timestamptz,
  created_at timestamptz not null default now(),
  tx_signature text not null
);

create index idx_licitations_status on public.licitations(status);
create index idx_licitations_authority on public.licitations(authority_wallet);
create index idx_licitations_dates on public.licitations(commit_phase_end, reveal_phase_end);

-- ============ PROPOSALS ============
create table public.proposals (
  on_chain_address text primary key,
  licitation_address text references public.licitations(on_chain_address) on delete cascade,
  bidder_wallet text not null,
  commit_hash text not null,
  revealed_value_cents bigint,
  status text not null default 'committed' check (status in ('committed', 'revealed', 'disqualified')),
  committed_at timestamptz not null,
  revealed_at timestamptz,
  tx_commit text not null,
  tx_reveal text
);

create index idx_proposals_licitation on public.proposals(licitation_address);
create unique index idx_proposals_unique on public.proposals(licitation_address, bidder_wallet);

-- ============ RLS — leitura pública (princípio da publicidade) ============
alter table public.licitations enable row level security;
alter table public.proposals enable row level security;

create policy "Licitações são públicas"
  on public.licitations for select using (true);

create policy "Propostas reveladas são públicas; commits só pro próprio bidder"
  on public.proposals for select using (
    status = 'revealed'
    or status = 'disqualified'
    or bidder_wallet = auth.jwt() ->> 'wallet'
  );

-- ============ Realtime ============
alter publication supabase_realtime add table public.licitations;
alter publication supabase_realtime add table public.proposals;
