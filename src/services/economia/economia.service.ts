import { prisma } from "@/lib/prisma";
import { Economia } from "@prisma/client";
import { syncAleatorio } from "../aleatorio/aleatorio.service";

// services/economiaService.ts
export async function createEconomiaService(params: {
  name: string;
  valorCents: number | null;
  cicloId: string;
}) {
  const { name, valorCents, cicloId } = params;

  const economia = await prisma.economia.create({
    data: {
      nome: name,
      valor: valorCents ?? 0, // null vira 0
      isGuardado: false,
      cicloId,
    },
  });

  await syncAleatorio(cicloId);
  return economia;
}

export async function editEconomiaService(economiaId: string, params: {
  name: string;
  valorCents: number | null;
}) {
  const { name, valorCents} = params;

  const economia = await prisma.economia.findUnique({ where: { id: economiaId } });
  
  if (!economia) return null;
  

  const economiaAtualizada = await prisma.economia.update({
    where: {id: economiaId},
    data: {
      nome: name,
      valor: valorCents ?? 0, // null vira 0
    },
  });

  await syncAleatorio(economia.cicloId);
  return economiaAtualizada;
}

export async function toggleGuardarEconomiaService(economiaId: string) {
  const economia = await prisma.economia.findUnique({
    where: { id: economiaId },
  });

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

  const economia = await prisma.economia.findUnique({ 
    where: { 
      id: economiaId 
    },
    select: { cicloId: true } 
  });

  if (!economia) return null;

  const economiaDeletada = await prisma.economia.delete({
    where: {  id: economiaId  }
  });

  await syncAleatorio(economia.cicloId);
  return economiaDeletada;
}