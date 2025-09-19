import { prisma } from "@/lib/prisma";

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
      isPago: false,
      cicloId,
    },
  });
}