
// utils/semanas.ts
import * as tz from "date-fns-tz";


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
  const dia = Number(partes.find((p) => p.type === "day")?.value);

  // início do mês local
  const dataInicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
  // fim do mês local (último dia)
  const dataFim = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59));

  return { dataInicio, dataFim };
}


export function gerarSemanasParaCiclo(dataInicio: Date, dataFim: Date) {
  const semanas: Array<{ inicio: Date; fim: Date }> = [];
  
  // Adiciona +1 dia na data de início
  const inicioMaisUm = new Date(dataInicio);
  inicioMaisUm.setDate(inicioMaisUm.getDate() + 1);
  inicioMaisUm.setHours(0, 0, 0, 0);
  
  // Trabalha com as datas +1
  let inicioSemana = new Date(inicioMaisUm.getFullYear(), inicioMaisUm.getMonth(), inicioMaisUm.getDate());
  let semanaAtual = 1;
  
  const fimCiclo = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate(), 23, 59, 59, 999);
  
  while (inicioSemana <= fimCiclo && semanaAtual <= 4) {
    if (semanaAtual <= 3) {
      // Para as 3 primeiras semanas: exatamente 7 dias
      const fimSemana = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + 6, 23, 59, 59, 999);
      
      semanas.push({
        inicio: new Date(inicioSemana),
        fim: fimSemana,
      });
      
      // Próxima semana começa no dia seguinte
      inicioSemana = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + 7);
    } else {
      // Última semana: vai até o fim do ciclo (+1)
      semanas.push({
        inicio: new Date(inicioSemana),
        fim: new Date(fimCiclo),
      });
    }
    
    semanaAtual++;
  }
  
  return semanas;
}