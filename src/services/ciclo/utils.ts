
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


// /**
//  * Gera as semanas para um ciclo baseado na data de início e fim
//  * A última semana pode ter mais de 7 dias para cobrir todo o período do ciclo
//  */
export function gerarSemanasParaCiclo(dataInicio: Date, dataFim: Date) {
  const semanas: Array<{ inicio: Date; fim: Date }> = [];
  
  // Copia as datas para não modificar as originais
  let inicioSemana = new Date(dataInicio);
  let semanaAtual = 1;
  
  while (inicioSemana <= dataFim && semanaAtual <= 4) {
    // Para as 3 primeiras semanas, usar exatamente 7 dias
    if (semanaAtual <= 3) {
      const fimSemana = new Date(inicioSemana);
      fimSemana.setUTCDate(inicioSemana.getUTCDate() + 6);
      fimSemana.setUTCHours(23, 59, 59, 999);
      
      semanas.push({
        inicio: new Date(inicioSemana),
        fim: fimSemana,
      });
      
      // Próxima semana começa no dia seguinte
      inicioSemana = new Date(fimSemana);
      inicioSemana.setUTCDate(inicioSemana.getUTCDate() + 1);
      inicioSemana.setUTCHours(0, 0, 0, 0);
    } else {
      // Última semana: vai até o fim do ciclo
      semanas.push({
        inicio: new Date(inicioSemana),
        fim: new Date(dataFim),
      });
    }
    
    semanaAtual++;
  }
  
  return semanas;
}