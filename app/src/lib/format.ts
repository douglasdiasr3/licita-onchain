import BN from "bn.js";

/**
 * Formata centavos como BRL: 50000_00 (cents) → "R$ 50.000,00"
 */
export function formatBRL(cents: BN | number | string): string {
  const value = typeof cents === "object" ? cents.toString() : String(cents);
  const reais = Number(value) / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Trunca uma chave pública para exibição: "abcd...wxyz"
 */
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formata timestamp Unix (segundos) como data/hora pt-BR.
 */
export function formatDateTime(unixSeconds: number | BN): string {
  const ts = typeof unixSeconds === "object" ? unixSeconds.toNumber() : unixSeconds;
  return new Date(ts * 1000).toLocaleString("pt-BR");
}

/**
 * Diferença em segundos entre agora e um timestamp futuro.
 */
export function secondsUntil(unixSeconds: number | BN): number {
  const ts = typeof unixSeconds === "object" ? unixSeconds.toNumber() : unixSeconds;
  return Math.max(0, ts - Math.floor(Date.now() / 1000));
}

/**
 * Formata um input de texto para o formato de moeda pt-BR (ex: "1.234,56")
 */
export function formatCurrencyInput(value: string): string {
  const onlyNumbers = value.replace(/\D/g, "");
  if (!onlyNumbers) return "";
  const numberValue = parseFloat(onlyNumbers) / 100;
  return numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte o formato de moeda ("1.234,56") para float string ("1234.56")
 */
export function parseCurrencyInput(formattedValue: string): string {
  if (!formattedValue) return "0";
  return formattedValue.replace(/\./g, "").replace(",", ".");
}
