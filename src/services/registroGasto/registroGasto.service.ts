// services/registroGasto/registroGasto.service.ts
import { prisma } from "@/lib/prisma";
import { CreateRegistroGastoDTO } from "@/dtos/registroGasto.schema";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; type: "fora-ciclo" | "fora-semana" };

export async function createRegistroGastoService(
  params: CreateRegistroGastoDTO
): Promise<ServiceResult<any>> {
  const { name, valorCents, data, gastoId, semanaId, permission } = params;

  // carrega a semana junto com o ciclo
  const semana = await prisma.semana.findUnique({
    where: { id: semanaId },
    include: { ciclo: true },
  });

  if (!semana) {
    return { ok: false, message: "Semana não encontrada.", type: "fora-semana" };
  }

  const dataInicioCiclo = new Date(semana.ciclo.dataInicio);
  const dataFimCiclo = new Date(semana.ciclo.dataFim);

  // 1. Verifica se a data pertence ao ciclo
  if (data < dataInicioCiclo || data > dataFimCiclo) {
    return {
      ok: false,
      message: "A data escolhida não pertence ao ciclo atual.",
      type: "fora-ciclo",
    };
  }

  // 2. Verifica se a data pertence à semana enviada
  const dataInicioSemana = new Date(semana.dataInicio);
  const dataFimSemana = new Date(semana.dataFim);

  if (data < dataInicioSemana || data > dataFimSemana) {
    if (!permission) {
      return {
        ok: false,
        message: "A data selecionada não pertence à essa semana.",
        type: "fora-semana",
      };
    } 
  }

  // Se a data não pertence à semana enviada, tenta encontrar a semana correta
  const semanaCorreta = await prisma.semana.findFirst({
    where: {
      cicloId: semana.cicloId, // garante que está no ciclo atual
      dataInicio: { lte: data },
      dataFim: { gte: data },
    },
  });

  if (!semanaCorreta) {
    return {
      ok: false,
      message: "Não foi encontrada uma semana correspondente a esta data.",
      type: "fora-semana",
    };
  }


  // 3. Tudo ok → cria registro
  const registro = await prisma.registroGasto.create({
    data: {
      name,
      valor: valorCents ?? 0,
      data,
      gastoId,
      semanaId: semanaCorreta.id || semanaId,
    },
  });

  return { ok: true, data: registro };
}
