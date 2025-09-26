// export function formatCurrencyFromCents(cents: number): string {
//     return new Intl.NumberFormat("pt-BR", {
//         style: "currency",
//         currency: "BRL",
//         minimumFractionDigits: 2,
//     }).format(cents / 100)
// }

export function formatCurrencyFromCents(valueInCents: number): string {
  if (valueInCents == null) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valueInCents / 100);
}