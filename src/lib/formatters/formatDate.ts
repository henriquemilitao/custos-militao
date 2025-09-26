// utils/formatters.ts

// Valida e normaliza a data
function parseDate(date?: string | Date | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

// Ex: 26/09/25
export function formatDateShort(date?: string | Date | null): string {
  const d = parseDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

// Ex: 26/09
export function formatDateDayMonth(date?: string | Date | null): string {
  const d = parseDate(date);
  if (!d) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

// Ex: 26/09 - 30/09
export function formatPeriodoDayMonth(
  inicio?: string | Date | null,
  fim?: string | Date | null
): string {
  return `${formatDateDayMonth(inicio)} - ${formatDateDayMonth(fim)}`;
}
