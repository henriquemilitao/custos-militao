export const formatarData = (data?: string | Date | null): string => {
  if (!data) return "-";

  const d = new Date(data);
  if (isNaN(d.getTime())) return "-"; // se não for data válida

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
};
