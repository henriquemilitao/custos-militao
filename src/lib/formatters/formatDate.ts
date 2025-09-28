// utils/formatters.ts

// Valida e normaliza a data
function parseDate(date?: string | Date | null): Date | null {
  if (!date) return null;

  // Se for string no formato ISO sem timezone, trata como local (não UTC)
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2} /.test(date)) {
    const [ano, mes, dia] = date.split(" ")[0].split("-").map(Number);
    const [hora, minuto, segundo] = date.split(" ")[1].split(":").map(Number);
    return new Date(ano, mes - 1, dia, hora, minuto, segundo); // <<< LOCAL
  }

  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

// Ex: 26/09/25
export function formatDateShort(date?: string | Date | null): string {
  const d = parseDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Campo_Grande",
  }).format(d);
}

// Ex: 26/09
export function formatDateDayMonth(date?: string | Date | null): string {
  const d = parseDate(date);
  if (!d) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Campo_Grande",
  });
}

// Ex: 26/09 - 30/09
export function formatPeriodoDayMonth(
  inicio?: string | Date | null,
  fim?: string | Date | null
): string {
  return `${formatDateDayMonth(inicio)} - ${formatDateDayMonth(fim)}`;
}

// Ex: "2025-09-01T00:00:00.000Z" | Date -> "01/09"
export function formatIsoToDayMonth(date?: string | Date | null): string {
  if (!date) return "-";

  // Se for Date, converte pra ISO
  const iso = date instanceof Date ? date.toISOString() : date;

  const [ano, mes, dia] = iso.split("T")[0].split("-");
  return `${dia}/${mes}`;
}
