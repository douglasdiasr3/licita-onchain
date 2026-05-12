import { keccak_256 } from "js-sha3";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

/**
 * Computa o hash de commitment para uma proposta selada.
 *
 * IMPORTANTE: Esta função DEVE produzir exatamente o mesmo hash
 * que o programa Anchor calcula no Rust. A ordem dos bytes é:
 *
 *   keccak256(value_le_bytes(8) || nonce(32) || bidder_pubkey(32))
 */
export function computeCommitHash(
  value: BN,
  nonce: Uint8Array,
  bidder: PublicKey
): Uint8Array {
  if (nonce.length !== 32) {
    throw new Error("Nonce deve ter exatamente 32 bytes");
  }

  // value como u64 little-endian (8 bytes)
  const valueBytes = value.toArrayLike(Buffer, "le", 8);

  const buffer = Buffer.concat([
    valueBytes,
    Buffer.from(nonce),
    bidder.toBuffer(),
  ]);

  return new Uint8Array(keccak_256.arrayBuffer(buffer));
}

/**
 * Gera um nonce aleatório de 32 bytes usando a Web Crypto API.
 */
export function generateNonce(): Uint8Array {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
}

/**
 * Salva o segredo da proposta no localStorage para o usuário recuperar
 * na hora do reveal. Em produção, criptografar com chave derivada da wallet.
 */
export function saveProposalSecret(
  licitationAddress: string,
  bidderAddress: string,
  value: BN,
  nonce: Uint8Array
): void {
  const key = `licita:proposal:${licitationAddress}:${bidderAddress}`;
  const data = {
    value: value.toString(),
    nonce: bytesToHex(nonce),
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadProposalSecret(
  licitationAddress: string,
  bidderAddress: string
): { value: BN; nonce: Uint8Array } | null {
  const key = `licita:proposal:${licitationAddress}:${bidderAddress}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const data = JSON.parse(raw);
  return {
    value: new BN(data.value),
    nonce: hexToBytes(data.nonce),
  };
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Calcula SHA-256 de um arquivo (PDF do edital, anexo, etc).
 */
export async function sha256File(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return new Uint8Array(hash);
}
