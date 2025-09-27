import { prisma } from "@/lib/prisma";
import { Economia } from "@prisma/client";

// services/economiaService.ts
export async function createEconomiaService(params: {
  name: string;
  valorCents: number | null;
  cicloId: string;
}) {
  const { name, valorCents, cicloId } = params;

  return prisma.economia.create({
    data: {
      nome: name,
      valor: valorCents ?? 0, // null vira 0
      isGuardado: false,
      cicloId,
    },
  });
}

export async function editEconomiaService(economiaId: string, params: {
  name: string;
  valorCents: number | null;
}) {
  const { name, valorCents} = params;

  return prisma.economia.update({
    where: {id: economiaId},
    data: {
      nome: name,
      valor: valorCents ?? 0, // null vira 0
    },
  });
}

export async function toggleGuardarEconomiaService(economiaId: string) {
  const economia = await prisma.economia.findUnique({
    where: { id: economiaId },
  });

  console.log(economia)
  if (!economia) return null;

  return prisma.economia.update({
    where: {
      id: economiaId
    },
    data: {
      isGuardado: !economia.isGuardado,
      dataGuardado: economia.isGuardado ? null : new Date()
    }
  })
}

export async function deleteEconomiaService(economiaId: string){
  return prisma.economia.delete({
    where: {id: economiaId}
  });
}