import { prisma } from "@/lib/prisma";
import { CreateRegistroGastoDTO } from "@/dtos/registroGasto.schema";

export async function createRegistroGastoService(params: CreateRegistroGastoDTO) {
  const { name, valorCents, data, gastoId, semanaId } = params;

  return prisma.registroGasto.create({
    data: {
      name,
      valor: valorCents ?? 0,
      data,
      gastoId,
      semanaId,
    },
  });
}
