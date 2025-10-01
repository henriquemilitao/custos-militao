
// services/utils.ts
export function getMesAtualTimeZone(tz: string) {
  const agora = new Date();

  // formata data no timezone desejado
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  // pega ano, mês e dia locais
  const partes = formatador.formatToParts(agora);
  const ano = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value) - 1; // zero-based
  // const dia = Number(partes.find((p) => p.type === "day")?.value);

  // início do mês local
  const dataInicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
  // fim do mês local (último dia)
  const dataFim = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59));

  return { dataInicio, dataFim };
}


export function gerarSemanasParaCiclo(dataInicio: Date, dataFim: Date) {
  const semanas: Array<{ inicio: Date; fim: Date }> = [];

  // Início do ciclo já às 04:00
  let inicioSemana = new Date(
    dataInicio.getFullYear(),
    dataInicio.getMonth(),
    dataInicio.getDate(),
    4, 0, 0, 0
  );
  let semanaAtual = 1;

  // Fim do ciclo às 03:59:59.999
  const fimCiclo = new Date(
    dataFim.getFullYear(),
    dataFim.getMonth(),
    dataFim.getDate(),
    3, 59, 59, 999
  );

  while (inicioSemana <= fimCiclo && semanaAtual <= 4) {
    if (semanaAtual <= 3) {
      // Cada semana dura 7 dias completos (até o próximo dia às 03:59)
      const fimSemana = new Date(
        inicioSemana.getFullYear(),
        inicioSemana.getMonth(),
        inicioSemana.getDate() + 7, // aqui troquei de +6 -> +7
        3, 59, 59, 999
      );

      semanas.push({
        inicio: new Date(inicioSemana),
        fim: fimSemana,
      });

      // Próxima semana começa no mesmo dia às 04:00
      inicioSemana = new Date(
        inicioSemana.getFullYear(),
        inicioSemana.getMonth(),
        inicioSemana.getDate() + 7,
        4, 0, 0, 0
      );
    } else {
      // Última semana: vai até o fim do ciclo (03:59)
      semanas.push({
        inicio: new Date(inicioSemana),
        fim: new Date(fimCiclo),
      });
    }

    semanaAtual++;
  }

  return semanas;
}


