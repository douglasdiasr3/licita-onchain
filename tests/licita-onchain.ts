import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { LicitaOnchain } from "../target/types/licita_onchain";
import { keccak_256 } from "js-sha3";
import { expect } from "chai";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("licita-onchain", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.LicitaOnchain as Program<LicitaOnchain>;

  // Atores
  const pregoeiro = Keypair.generate();
  const fornecedorA = Keypair.generate();
  const fornecedorB = Keypair.generate();

  // Dados do edital
  const editalHash = randomBytes32();
  const title = "Pregão 001/2025 - Notebooks";
  const editalUri = "ipfs://QmExampleHashAbc123";
  const estimatedValue = new BN(500_000_00); // R$ 500.000 em centavos

  // PDAs
  let licitationPda: PublicKey;

  before(async () => {
    // Airdrop pra todos
    await airdrop(provider, pregoeiro.publicKey, 2);
    await airdrop(provider, fornecedorA.publicKey, 2);
    await airdrop(provider, fornecedorB.publicKey, 2);

    [licitationPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("licitation"),
        pregoeiro.publicKey.toBuffer(),
        Buffer.from(editalHash),
      ],
      program.programId
    );
  });

  it("pregoeiro cria a licitação", async () => {
    const now = Math.floor(Date.now() / 1000);
    const commitEnd = new BN(now + 5);    // 5s pra commitar
    const revealEnd = new BN(now + 15);   // 15s total

    await program.methods
      .createLicitation(
        Array.from(editalHash),
        title,
        editalUri,
        estimatedValue,
        commitEnd,
        revealEnd
      )
      .accounts({
        licitation: licitationPda,
        authority: pregoeiro.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([pregoeiro])
      .rpc();

    const licitation = await program.account.licitation.fetch(licitationPda);
    expect(licitation.title).to.equal(title);
    expect(licitation.estimatedValue.toString()).to.equal(estimatedValue.toString());
    expect(licitation.proposalCount).to.equal(0);
    expect(licitation.status).to.deep.equal({ open: {} });
  });

  it("fornecedor A envia proposta selada (R$ 50.000)", async () => {
    const value = new BN(50_000_00);
    const nonce = randomBytes32();
    const commitHash = computeCommitHash(value, nonce, fornecedorA.publicKey);

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), licitationPda.toBuffer(), fornecedorA.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .commitProposal(Array.from(commitHash))
      .accounts({
        licitation: licitationPda,
        proposal: proposalPda,
        bidder: fornecedorA.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([fornecedorA])
      .rpc();

    // Salva pro reveal
    (fornecedorA as any).secret = { value, nonce, proposalPda };

    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.status).to.deep.equal({ committed: {} });
    expect(proposal.revealedValue).to.be.null;
  });

  it("fornecedor B envia proposta selada (R$ 48.000)", async () => {
    const value = new BN(48_000_00);
    const nonce = randomBytes32();
    const commitHash = computeCommitHash(value, nonce, fornecedorB.publicKey);

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), licitationPda.toBuffer(), fornecedorB.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .commitProposal(Array.from(commitHash))
      .accounts({
        licitation: licitationPda,
        proposal: proposalPda,
        bidder: fornecedorB.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([fornecedorB])
      .rpc();

    (fornecedorB as any).secret = { value, nonce, proposalPda };

    const licitation = await program.account.licitation.fetch(licitationPda);
    expect(licitation.proposalCount).to.equal(2);
  });

  it("aguarda fim da fase de commit", async () => {
    await sleep(6000);
  });

  it("fornecedor A revela proposta (hash valida)", async () => {
    const { value, nonce, proposalPda } = (fornecedorA as any).secret;

    await program.methods
      .revealProposal(value, Array.from(nonce))
      .accounts({
        licitation: licitationPda,
        proposal: proposalPda,
        bidder: fornecedorA.publicKey,
      })
      .signers([fornecedorA])
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.status).to.deep.equal({ revealed: {} });
    expect(proposal.revealedValue!.toString()).to.equal(value.toString());

    const licitation = await program.account.licitation.fetch(licitationPda);
    expect(licitation.lowestValue.toString()).to.equal(value.toString());
    expect(licitation.winner!.toBase58()).to.equal(fornecedorA.publicKey.toBase58());
  });

  it("fornecedor B revela proposta menor → assume liderança", async () => {
    const { value, nonce, proposalPda } = (fornecedorB as any).secret;

    await program.methods
      .revealProposal(value, Array.from(nonce))
      .accounts({
        licitation: licitationPda,
        proposal: proposalPda,
        bidder: fornecedorB.publicKey,
      })
      .signers([fornecedorB])
      .rpc();

    const licitation = await program.account.licitation.fetch(licitationPda);
    expect(licitation.lowestValue.toString()).to.equal(value.toString());
    expect(licitation.winner!.toBase58()).to.equal(fornecedorB.publicKey.toBase58());
  });

  it("rejeita reveal com nonce errado", async () => {
    const value = new BN(40_000_00);
    const wrongNonce = randomBytes32();
    const fakeBidder = Keypair.generate();
    await airdrop(provider, fakeBidder.publicKey, 1);

    // Commit com hash válido
    const realNonce = randomBytes32();
    const commitHash = computeCommitHash(value, realNonce, fakeBidder.publicKey);

    // Cria nova licitação só pra esse teste (a outra já está em reveal phase)
    const newEditalHash = randomBytes32();
    const [newLicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("licitation"), pregoeiro.publicKey.toBuffer(), Buffer.from(newEditalHash)],
      program.programId
    );

    const now = Math.floor(Date.now() / 1000);
    await program.methods
      .createLicitation(
        Array.from(newEditalHash),
        "Teste hash errado",
        "ipfs://test",
        new BN(1000),
        new BN(now + 2),
        new BN(now + 10)
      )
      .accounts({
        licitation: newLicPda,
        authority: pregoeiro.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([pregoeiro])
      .rpc();

    const [propPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), newLicPda.toBuffer(), fakeBidder.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .commitProposal(Array.from(commitHash))
      .accounts({
        licitation: newLicPda,
        proposal: propPda,
        bidder: fakeBidder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([fakeBidder])
      .rpc();

    await sleep(3000);

    // Tenta revelar com nonce errado → deve falhar
    try {
      await program.methods
        .revealProposal(value, Array.from(wrongNonce))
        .accounts({
          licitation: newLicPda,
          proposal: propPda,
          bidder: fakeBidder.publicKey,
        })
        .signers([fakeBidder])
        .rpc();
      expect.fail("Deveria ter falhado com HashMismatch");
    } catch (err: any) {
      expect(err.toString()).to.include("HashMismatch");
    }
  });
});

// ============================================================
//                         HELPERS
// ============================================================

function randomBytes32(): Uint8Array {
  const arr = new Uint8Array(32);
  for (let i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
  return arr;
}

function computeCommitHash(value: BN, nonce: Uint8Array, bidder: PublicKey): Uint8Array {
  const buf = Buffer.concat([
    value.toArrayLike(Buffer, "le", 8),
    Buffer.from(nonce),
    bidder.toBuffer(),
  ]);
  return new Uint8Array(keccak_256.arrayBuffer(buf));
}

async function airdrop(provider: anchor.AnchorProvider, pubkey: PublicKey, sol: number) {
  const sig = await provider.connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
  await provider.connection.confirmTransaction(sig, "confirmed");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
