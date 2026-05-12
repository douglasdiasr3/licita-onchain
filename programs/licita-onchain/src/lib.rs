use anchor_lang::prelude::*;
use solana_program::keccak;

declare_id!("7Kob7MLNcumNP9irCTPqY2H3iRF8nPuVXxU2JX1MDm7s");

#[program]
pub mod licita_onchain {
    use super::*;

    /// Cria ou atualiza o perfil do usuário on-chain.
    pub fn create_profile(
        ctx: Context<CreateProfile>,
        name: String,
        document: String,
        role: UserRole,
    ) -> Result<()> {
        require!(name.len() <= 50, LicitaError::NameTooLong);
        require!(document.len() <= 20, LicitaError::DocumentTooLong);

        let profile = &mut ctx.accounts.profile;
        profile.authority = ctx.accounts.authority.key();
        profile.name = name;
        profile.document = document;
        profile.role = role;
        profile.bump = ctx.bumps.profile;

        Ok(())
    }

    /// Cria uma nova licitação. Apenas o pregoeiro (signer) pode fazer.
    /// O hash do edital é registrado on-chain; o PDF fica off-chain (IPFS).
    pub fn create_licitation(
        ctx: Context<CreateLicitation>,
        edital_hash: [u8; 32],
        title: String,
        description: String,
        orgao: String,
        edital_uri: String,
        estimated_value: u64,
        commit_phase_end: i64,
        reveal_phase_end: i64,
    ) -> Result<()> {
        require!(title.len() <= 100, LicitaError::TitleTooLong);
        require!(description.len() <= 200, LicitaError::DescriptionTooLong);
        require!(orgao.len() <= 50, LicitaError::OrgaoTooLong);
        require!(edital_uri.len() <= 200, LicitaError::UriTooLong);

        let clock = Clock::get()?;
        require!(
            commit_phase_end > clock.unix_timestamp,
            LicitaError::CommitPhaseInPast
        );
        require!(
            reveal_phase_end > commit_phase_end,
            LicitaError::InvalidTimeline
        );

        let licitation = &mut ctx.accounts.licitation;
        licitation.authority = ctx.accounts.authority.key();
        licitation.edital_hash = edital_hash;
        licitation.title = title;
        licitation.description = description;
        licitation.orgao = orgao;
        licitation.edital_uri = edital_uri;
        licitation.estimated_value = estimated_value;
        licitation.commit_phase_end = commit_phase_end;
        licitation.reveal_phase_end = reveal_phase_end;
        licitation.status = LicitationStatus::Open;
        licitation.proposal_count = 0;
        licitation.lowest_value = u64::MAX;
        licitation.winner = None;
        licitation.created_at = clock.unix_timestamp;
        licitation.bump = ctx.bumps.licitation;

        emit!(LicitationCreated {
            licitation: licitation.key(),
            authority: licitation.authority,
            estimated_value,
        });

        Ok(())
    }

    /// Fornecedor envia proposta selada (apenas hash).
    /// hash = keccak256(value_le_bytes || nonce || bidder_pubkey)
    /// Ninguém — nem o pregoeiro — consegue ver o valor antes do reveal.
    pub fn commit_proposal(
        ctx: Context<CommitProposal>,
        commit_hash: [u8; 32],
    ) -> Result<()> {
        let licitation = &mut ctx.accounts.licitation;
        let clock = Clock::get()?;

        require!(
            licitation.status == LicitationStatus::Open,
            LicitaError::LicitationNotOpen
        );
        require!(
            clock.unix_timestamp < licitation.commit_phase_end,
            LicitaError::CommitPhaseEnded
        );

        let proposal = &mut ctx.accounts.proposal;
        proposal.licitation = licitation.key();
        proposal.bidder = ctx.accounts.bidder.key();
        proposal.commit_hash = commit_hash;
        proposal.committed_at = clock.unix_timestamp;
        proposal.revealed_value = None;
        proposal.revealed_at = None;
        proposal.status = ProposalStatus::Committed;
        proposal.bump = ctx.bumps.proposal;

        licitation.proposal_count = licitation.proposal_count.saturating_add(1);

        emit!(ProposalCommitted {
            proposal: proposal.key(),
            licitation: proposal.licitation,
            bidder: proposal.bidder,
        });

        Ok(())
    }

    /// Fornecedor revela o conteúdo da proposta na fase de revelação.
    /// O programa recomputa o hash e valida — se não bater, rejeita.
    /// Ranqueia automaticamente: menor valor vira "lowest_value".
    pub fn reveal_proposal(
        ctx: Context<RevealProposal>,
        value: u64,
        nonce: [u8; 32],
    ) -> Result<()> {
        let licitation = &mut ctx.accounts.licitation;
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(
            licitation.status == LicitationStatus::Open,
            LicitaError::LicitationNotOpen
        );
        require!(
            clock.unix_timestamp >= licitation.commit_phase_end,
            LicitaError::CommitPhaseStillOpen
        );
        require!(
            clock.unix_timestamp < licitation.reveal_phase_end,
            LicitaError::RevealPhaseEnded
        );
        require!(
            proposal.status == ProposalStatus::Committed,
            LicitaError::ProposalNotCommitted
        );
        require!(value > 0, LicitaError::InvalidValue);

        // Recomputa hash: keccak256(value_le || nonce || bidder)
        let mut buffer = Vec::with_capacity(8 + 32 + 32);
        buffer.extend_from_slice(&value.to_le_bytes());
        buffer.extend_from_slice(&nonce);
        buffer.extend_from_slice(&proposal.bidder.to_bytes());

        let computed = keccak::hash(&buffer).to_bytes();

        require!(
            computed == proposal.commit_hash,
            LicitaError::HashMismatch
        );

        // Atualiza proposta
        proposal.revealed_value = Some(value);
        proposal.revealed_at = Some(clock.unix_timestamp);
        proposal.status = ProposalStatus::Revealed;

        // Atualiza ranking — quem tem menor valor lidera
        if value < licitation.lowest_value {
            licitation.lowest_value = value;
            licitation.winner = Some(proposal.bidder);
        }

        emit!(ProposalRevealed {
            proposal: proposal.key(),
            licitation: proposal.licitation,
            bidder: proposal.bidder,
            value,
        });

        Ok(())
    }

    /// Pregoeiro homologa o resultado após fim da fase de revelação.
    pub fn homologate(ctx: Context<Homologate>) -> Result<()> {
        let licitation = &mut ctx.accounts.licitation;
        let clock = Clock::get()?;

        require!(
            licitation.authority == ctx.accounts.authority.key(),
            LicitaError::Unauthorized
        );
        require!(
            licitation.status == LicitationStatus::Open,
            LicitaError::LicitationNotOpen
        );
        require!(
            clock.unix_timestamp >= licitation.reveal_phase_end,
            LicitaError::RevealPhaseStillOpen
        );
        require!(
            licitation.winner.is_some(),
            LicitaError::NoValidProposal
        );

        licitation.status = LicitationStatus::Homologated;
        licitation.homologated_at = Some(clock.unix_timestamp);

        emit!(LicitationHomologated {
            licitation: licitation.key(),
            winner: licitation.winner.unwrap(),
            winning_value: licitation.lowest_value,
        });

        Ok(())
    }
}

// ============================================================
//                         ACCOUNTS
// ============================================================

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"profile", authority.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(edital_hash: [u8; 32])]
pub struct CreateLicitation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Licitation::INIT_SPACE,
        seeds = [b"licitation", authority.key().as_ref(), edital_hash.as_ref()],
        bump
    )]
    pub licitation: Account<'info, Licitation>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitProposal<'info> {
    #[account(mut)]
    pub licitation: Account<'info, Licitation>,

    #[account(
        init,
        payer = bidder,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", licitation.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub bidder: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealProposal<'info> {
    #[account(mut)]
    pub licitation: Account<'info, Licitation>,

    #[account(
        mut,
        seeds = [b"proposal", licitation.key().as_ref(), bidder.key().as_ref()],
        bump = proposal.bump,
        has_one = bidder,
    )]
    pub proposal: Account<'info, Proposal>,

    pub bidder: Signer<'info>,
}

#[derive(Accounts)]
pub struct Homologate<'info> {
    #[account(mut)]
    pub licitation: Account<'info, Licitation>,

    pub authority: Signer<'info>,
}

// ============================================================
//                          STATE
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub authority: Pubkey,
    #[max_len(50)]
    pub name: String,
    #[max_len(20)]
    pub document: String,
    pub role: UserRole,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Licitation {
    pub authority: Pubkey,
    pub edital_hash: [u8; 32],
    #[max_len(100)]
    pub title: String,
    #[max_len(200)]
    pub description: String,
    #[max_len(50)]
    pub orgao: String,
    #[max_len(200)]
    pub edital_uri: String,
    pub estimated_value: u64,
    pub commit_phase_end: i64,
    pub reveal_phase_end: i64,
    pub status: LicitationStatus,
    pub proposal_count: u32,
    pub lowest_value: u64,
    pub winner: Option<Pubkey>,
    pub created_at: i64,
    pub homologated_at: Option<i64>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub licitation: Pubkey,
    pub bidder: Pubkey,
    pub commit_hash: [u8; 32],
    pub committed_at: i64,
    pub revealed_value: Option<u64>,
    pub revealed_at: Option<i64>,
    pub status: ProposalStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum LicitationStatus {
    Open,
    Homologated,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Committed,
    Revealed,
    Disqualified,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum UserRole {
    Pregoeiro,
    Fornecedor,
}

// ============================================================
//                         EVENTS
// ============================================================

#[event]
pub struct LicitationCreated {
    pub licitation: Pubkey,
    pub authority: Pubkey,
    pub estimated_value: u64,
}

#[event]
pub struct ProposalCommitted {
    pub proposal: Pubkey,
    pub licitation: Pubkey,
    pub bidder: Pubkey,
}

#[event]
pub struct ProposalRevealed {
    pub proposal: Pubkey,
    pub licitation: Pubkey,
    pub bidder: Pubkey,
    pub value: u64,
}

#[event]
pub struct LicitationHomologated {
    pub licitation: Pubkey,
    pub winner: Pubkey,
    pub winning_value: u64,
}

// ============================================================
//                         ERRORS
// ============================================================

#[error_code]
pub enum LicitaError {
    #[msg("Title too long (max 100 chars)")]
    TitleTooLong,
    #[msg("URI too long (max 200 chars)")]
    UriTooLong,
    #[msg("Commit phase end must be in the future")]
    CommitPhaseInPast,
    #[msg("Invalid timeline: commit phase must end before reveal phase")]
    InvalidTimeline,
    #[msg("Licitation is not open")]
    LicitationNotOpen,
    #[msg("Commit phase has ended")]
    CommitPhaseEnded,
    #[msg("Commit phase is still open — wait for reveal phase")]
    CommitPhaseStillOpen,
    #[msg("Reveal phase has ended")]
    RevealPhaseEnded,
    #[msg("Reveal phase is still open — wait to homologate")]
    RevealPhaseStillOpen,
    #[msg("Proposal not in Committed state")]
    ProposalNotCommitted,
    #[msg("Hash mismatch — value or nonce incorrect")]
    HashMismatch,
    #[msg("Invalid value (must be > 0)")]
    InvalidValue,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("No valid proposal to homologate")]
    NoValidProposal,
    #[msg("Name too long (max 50 chars)")]
    NameTooLong,
    #[msg("Document too long (max 20 chars)")]
    DocumentTooLong,
    #[msg("Description too long (max 200 chars)")]
    DescriptionTooLong,
    #[msg("Orgao too long (max 50 chars)")]
    OrgaoTooLong,
}
