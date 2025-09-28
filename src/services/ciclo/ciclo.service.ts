import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { prisma } from "@/lib/prisma";

export async function getCicloById(cicloId: string) {
  return prisma.ciclo.findUnique({
    where: { id: cicloId },
    include: {
      economias: { orderBy: { createdAt: "asc" } },
      gastos: { orderBy: { createdAt: "asc" } },
      semanas: {
        include: {
          registros: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
}

export async function getCicloAtual(userId: string | undefined): Promise<CicloAtualDTO | null> {
  if (!userId) return null;

  const hoje = new Date();
  const ciclo = await prisma.ciclo.findFirst({
    where: {
      userId,
      dataInicio: { lte: hoje },
      dataFim: { gte: hoje },
    },
    include: {
      economias: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      gastos: {
        orderBy: [
          { tipo: "asc" },
          { createdAt: "asc" },
          { id: "asc" },
        ],
      },
      semanas: {
        include: {
          registros: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!ciclo) return null;

  // --- cálculos agregados ---
  const [
    somaEconomias,
    somaGastos,
    somaEconomiaJaGuardada,
    somaGastosUnicosJaRealizados,
    somaGastosPorMetaJaRealizados,
  ] = await Promise.all([
    prisma.economia.aggregate({ where: { cicloId: ciclo.id }, _sum: { valor: true } }),
    prisma.gasto.aggregate({ where: { cicloId: ciclo.id }, _sum: { valor: true } }),
    prisma.economia.aggregate({ where: { cicloId: ciclo.id, isGuardado: true }, _sum: { valor: true } }),
    prisma.gasto.aggregate({ where: { cicloId: ciclo.id, tipo: "single", isPago: true }, _sum: { valor: true } }),
    prisma.registroGasto.aggregate({ where: { gasto: { cicloId: ciclo.id } }, _sum: { valor: true } }),
  ]);

  const economiasMesTotal = somaEconomias._sum.valor ?? 0;
  const gastosMesTotal = somaGastos._sum.valor ?? 0;
  const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0;
  const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0;
  const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0;
  const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados;
  const disponivelMes = ciclo.valorTotal - economiasJaGuardadas - gastoTotalJaRealizado;

  // --- gastos por meta enriquecidos ---
  const registrosAgrupados = await prisma.registroGasto.groupBy({
    by: ["gastoId"],
    where: {
      gastoId: {
        in: (
          await prisma.gasto.findMany({
            where: { cicloId: ciclo.id },
            select: { id: true },
          })
        ).map((g) => g.id),
      },
    },
    _sum: { valor: true },
  });

  const gastosPorMetaTotais = ciclo.gastos
    .filter((g) => g.tipo === "goal")
    .map((g) => {
      const registro = registrosAgrupados.find((r) => r.gastoId === g.id);
      const totalJaGasto = registro?._sum.valor ?? 0;
      return {
        ...g,
        totalPlanejado: g.valor,
        totalJaGasto,
        totalDisponivel: g.valor - totalJaGasto,
      };
    });

  return {
    ...ciclo,
    economiasMesTotal,
    gastosMesTotal,
    economiasJaGuardadas,
    gastoTotalJaRealizado,
    disponivelMes,
    gastosPorMetaTotais,
  };
}

// ciclo imediatamente anterior
export async function getCicloAnterior(userId: string, cicloId: string) {
  const cicloAtual = await prisma.ciclo.findUnique({ where: { id: cicloId } });
  if (!cicloAtual) return null;

  return prisma.ciclo.findFirst({
    where: {
      userId,
      dataFim: { lt: cicloAtual.dataInicio },
    },
    orderBy: { dataFim: "desc" },
  });
}

// ciclo imediatamente posterior
export async function getCicloProximo(userId: string, cicloId: string) {
  const cicloAtual = await prisma.ciclo.findUnique({ where: { id: cicloId } });
  if (!cicloAtual) return null;

  return prisma.ciclo.findFirst({
    where: {
      userId,
      dataInicio: { gt: cicloAtual.dataFim },
    },
    orderBy: { dataInicio: "asc" },
  });
}
