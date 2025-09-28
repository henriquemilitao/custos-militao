import { prisma } from "@/lib/prisma";

export async function syncAleatorio(cicloId: string) {
  // 1. Buscar o ciclo
  const ciclo = await prisma.ciclo.findUnique({
    where: { id: cicloId },
    select: { valorTotal: true },
  });
  if (!ciclo) return;

  // 2. Somar economias
  const somaEconomias = await prisma.economia.aggregate({
    where: { cicloId },
    _sum: { valor: true },
  });

  // 3. Somar gastos (exceto Aleatório)
  const somaGastos = await prisma.gasto.aggregate({
    where: { cicloId, NOT: { name: "Aleatório" } },
    _sum: { valor: true },
  });

  const totalEconomias = somaEconomias._sum.valor ?? 0;
  const totalGastos = somaGastos._sum.valor ?? 0;

  // 4. Calcular valor do Aleatório
  const valorAleatorio = Math.max(
    0,
    ciclo.valorTotal * 100 - totalEconomias - totalGastos
  );

  // 5. Ver se já existe
  const aleatorio = await prisma.gasto.findFirst({
    where: { cicloId, name: "Aleatório" },
  });

  if (aleatorio) {
    // Atualiza
    await prisma.gasto.update({
      where: { id: aleatorio.id },
      data: { valor: valorAleatorio, tipo: "goal" },
    });
  } else {
    // Cria
    await prisma.gasto.create({
      data: {
        name: "Aleatório",
        valor: valorAleatorio,
        cicloId,
        tipo: "goal",
        isPago: false,
      },
    });
  }
}
