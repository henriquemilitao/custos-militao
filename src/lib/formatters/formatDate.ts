export const formatarData = (data: string | Date): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    // timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(data));
};

