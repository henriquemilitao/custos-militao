// services/registroGasto/registroGasto.service.ts

import { prisma } from "@/lib/prisma";
import { CreateRegistroGastoDTO, EditRegistroGastoDTO } from "@/dtos/registroGasto.schema";
import { startOfDay } from "date-fns";
import { syncAleatorio } from "../aleatorio/aleatorio.service";

// Tipo específico para o registro retornado pelo Prisma
interface RegistroGasto {
  id: string;
  name: string;
  valor: number;
  data: Date;
  gastoId: string;
  semanaId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para o resultado do service
interface RegistroGastoResult {
  ok: boolean;
  data?: RegistroGasto;
  message?: string;
  type?: "fora-ciclo" | "fora-semana";
}

function normalize(d: Date) {
  const date = new Date(d);
  // força o horário para 04:00:00
  date.setHours(4, 0, 0, 0);
  return date;
}

export async function createRegistroGastoService(
  params: CreateRegistroGastoDTO
): Promise<RegistroGastoResult> {
  const { name, valorCents, data, gastoId, semanaId, permission } = params;

  const semana = await prisma.semana.findUnique({
    where: { id: semanaId },
    include: { ciclo: true },
  });

  if (!semana) {
    return { ok: false, message: "Semana não encontrada.", type: "fora-semana" };
  }

  // 🔹 Normaliza datas
  const dataNorm = normalize(data);
  const inicioCiclo = normalize(semana.ciclo.dataInicio);
  const fimCiclo = normalize(semana.ciclo.dataFim);
  const inicioSemana = normalize(semana.dataInicio);
  const fimSemana = normalize(semana.dataFim);

  // 1. Verifica se pertence ao ciclo
  if (dataNorm < inicioCiclo || dataNorm > fimCiclo) {
    return {
      ok: false,
      message: "A data escolhida não pertence ao ciclo atual.",
      type: "fora-ciclo",
    };
  }

  // 2. Verifica se pertence à semana
  if (dataNorm < inicioSemana || dataNorm > fimSemana) {
    if (!permission) {
      return {
        ok: false,
        message: "A data selecionada não pertence à essa semana.",
        type: "fora-semana",
      };
    }
  }

  // 3. Localiza semana correta
  const semanaCorreta = await prisma.semana.findFirst({
    where: {
      cicloId: semana.cicloId,
      dataInicio: { lte: dataNorm },
      dataFim: { gte: dataNorm },
    },
  });

  if (!semanaCorreta) {
    return {
      ok: false,
      message: "Não foi encontrada uma semana correspondente a esta data.",
      type: "fora-semana",
    };
  }

  // 4. Cria registro
  const registro = await prisma.registroGasto.create({
    data: {
      name,
      valor: valorCents ?? 0,
      data: dataNorm,
      gastoId,
      semanaId: semanaCorreta.id || semanaId,
    },
  });

  return { ok: true, data: registro };
}

export async function editRegistroGastoService(
  registroId: string,
  params: EditRegistroGastoDTO
): Promise<RegistroGastoResult> {
  const registro = await prisma.registroGasto.findUnique({
    where: { id: registroId },
    include: { semana: { include: { ciclo: true } } },
  });

  if (!registro) {
    return { ok: false, message: "Registro não encontrado", type: "fora-semana" };
  }

  const { name, valorCents, data, semanaId, permission } = params;

  const semana = await prisma.semana.findUnique({
    where: { id: semanaId },
    include: { ciclo: true },
  });

  if (!semana) {
    return { ok: false, message: "Semana não encontrada.", type: "fora-semana" };
  }

  // 🔹 Normaliza apenas a data escolhida para evitar ruído de horas
  const dataNorm = normalize(data);

  // Mas mantém os limites originais da semana/ciclo
  const inicioCiclo = semana.ciclo.dataInicio;
  const fimCiclo = semana.ciclo.dataFim;
  const inicioSemana = semana.dataInicio;
  const fimSemana = semana.dataFim;

  if (dataNorm < inicioCiclo || dataNorm > fimCiclo) {
    return {
      ok: false,
      message: "A data escolhida não pertence ao ciclo atual.",
      type: "fora-ciclo",
    };
  }

  if (dataNorm < inicioSemana || dataNorm > fimSemana) {
    if (!permission) {
      return {
        ok: false,
        message: "A data selecionada não pertence à essa semana.",
        type: "fora-semana",
      };
    }
  }

  const semanaCorreta = await prisma.semana.findFirst({
    where: {
      cicloId: semana.cicloId,
      dataInicio: { lte: dataNorm },
      dataFim: { gte: dataNorm },
    },
  });

  if (!semanaCorreta) {
    return {
      ok: false,
      message: "Não foi encontrada uma semana correspondente a esta data.",
      type: "fora-semana",
    };
  }

  const updated = await prisma.registroGasto.update({
    where: { id: registroId },
    data: {
      name,
      valor: valorCents ?? 0,
      data: dataNorm,
      semanaId: semanaCorreta.id,
    },
  });
  
  // if (name !== "Aleatório") {
  //     await syncAleatorio(semana.cicloId);
  //   }

  return { ok: true, data: updated };
}

export async function deleteRegistroGastoService(registroId: string) {
  
  const registro = await prisma.registroGasto.findUnique({
    where: { id: registroId },
  });

  if (!registro) {
    return { ok: false, message: "Semana não encontrada.", type: "fora-semana" };
  }
  const registroDeleted = prisma.registroGasto.delete({ where: { id: registroId } });
  
  // if (name !== "Aleatório") {
  //     await syncAleatorio(semana.cicloId);
  //   }
  
  return registroDeleted
}