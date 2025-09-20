import { prisma } from "@/lib/prisma";
import { Economia } from "@prisma/client";

// services/economiaService.ts
export async function createEconomiaService(params: {
  nome: string;
  valorCents: number | null;
  cicloId: string;
}) {
  const { nome, valorCents, cicloId } = params;

  return prisma.economia.create({
    data: {
      nome,
      valor: valorCents ?? 0, // null vira 0
      isGuardado: false,
      cicloId,
    },
  });
}

export async function editEconomiaService(economiaId: string, params: {
  nome: string;
  valorCents: number | null;
}) {
  const { nome, valorCents} = params;

  return prisma.economia.update({
    where: {id: economiaId},
    data: {
      nome,
      valor: valorCents ?? 0, // null vira 0
    },
  });
}

export async function guardarEconomiaService(economiaId: string) {
  
  return prisma.economia.update({
    where: {
      id: economiaId
    },
    data: {
      isGuardado: true,
      dataGuardado: new Date()
    }
  })
}
