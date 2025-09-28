import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarSemanasParaCiclo, getMesAtualTimeZone } from "./utils";
import { syncAleatorio } from "../aleatorio/aleatorio.service";


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
  const disponivelMes = (ciclo.valorTotal * 100 - economiasJaGuardadas - gastoTotalJaRealizado);

  
    console.log({
      disponivelMes,
      cicloValorTotal: ciclo.valorTotal * 100,
      economiasJaGuardadas,
      gastoTotalJaRealizado
    })
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

  await syncAleatorio(ciclo.id);

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

export async function createCicloByValorTotalService(params: {
  valorCents: number | null;
  req: Request; // Next.js request
}) {
  const { valorCents, req } = params;
  
  // aqui pega a sessão do usuário logado
  const session = await auth.api.getSession({
    headers: req.headers, // importante!!
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const { dataInicio, dataFim } = getMesAtualTimeZone("America/Campo_Grande");
  const semanas = gerarSemanasParaCiclo(dataInicio, dataFim);

  // Cria o ciclo com as semanas em uma transação
  const ciclo = await prisma.$transaction(async (tx) => {
    const ciclo = await tx.ciclo.create({
      data: {
        valorTotal: valorCents ?? 0,
        dataInicio,
        dataFim,
        quantidadeSemanas: semanas.length,
        userId: session.user.id,
      },
    });

    // Cria as semanas para o ciclo
    await tx.semana.createMany({
      data: semanas.map((semana, index) => ({
        cicloId: ciclo.id,
        qualSemanaCiclo: index + 1,
        dataInicio: semana.inicio,
        dataFim: semana.fim,
      })),
    });

    return ciclo;
  });
  
  await syncAleatorio(ciclo.id);
  return ciclo;
}

export async function updateCicloValorTotalService(params: {
  cicloId: string;
  valorCents: number | null;
  req: Request; // Next.js request
}) {
  const { cicloId, valorCents, req } = params;

  // pega a sessão do usuário logado
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const ciclo = await prisma.ciclo.findUnique({
    where: { id: cicloId },
  });

  if (!ciclo) return null;

  // atualiza somente se o ciclo for do usuário logado
  const cicloAtualizado = await prisma.ciclo.updateMany({
    where: {
      id: cicloId,
      userId: session.user.id,
    },
    data: {
      valorTotal: valorCents ?? 0,
    },
  });

  if (cicloAtualizado.count === 0) {
    throw new Error("Ciclo não encontrado ou não pertence ao usuário");
  }
  
  await syncAleatorio(ciclo.id);

  // retorna o ciclo atualizado
  return cicloAtualizado
}
