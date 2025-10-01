// src/lib/currency.ts
export function moedaBRL(value: number | null | undefined): string {
  const n = typeof value === "number" && isFinite(value) ? value : 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export function parseCurrency(input: string | number | null | undefined): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (!input) return 0;
  const cleaned = String(input)
    .replace(/[^\d,-.]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned || "0");
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrencyBRL(value: number | ""): string {
  if (value === "") return "";
  return moedaBRL(value);
}
