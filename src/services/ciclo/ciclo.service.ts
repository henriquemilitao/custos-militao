import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarSemanasParaCiclo, getMesAtualTimeZone } from "./utils";
import { syncAleatorio } from "../aleatorio/aleatorio.service";

export type CicloComMes = {
  ciclo: CicloAtualDTO | null;
  mesReferencia: string; // sempre ISO string de uma data no mês
};

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

export async function getCicloAtual(userId: string | undefined): Promise<CicloComMes> {
  if (!userId) {
    return {
      ciclo: null,
      mesReferencia: new Date().toISOString(),
    };
  }

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

  if (!ciclo) {
    // Nenhum ciclo encontrado → retorna null + mês de hoje
    return {
      ciclo: null,
      mesReferencia: new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1)).toISOString(),
    };
  }

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
    ciclo: {
      ...ciclo,
      economiasMesTotal,
      gastosMesTotal,
      economiasJaGuardadas,
      gastoTotalJaRealizado,
      disponivelMes,
      gastosPorMetaTotais,
    },
    mesReferencia: new Date(Date.UTC(ciclo.dataInicio.getUTCFullYear(), ciclo.dataInicio.getUTCMonth(), 1)).toISOString(),
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
  req: Request;
}) {
  const { valorCents, req } = params;
  
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // pega início e fim do mês
  let { dataInicio, dataFim } = getMesAtualTimeZone("America/Campo_Grande");

  // padroniza início e fim no esquema 04:00 -> 03:59
  dataInicio = new Date(
    dataInicio.getFullYear(),
    dataInicio.getMonth(),
    dataInicio.getDate(),
    4, 0, 0, 0
  );

  dataFim = new Date(
    dataFim.getFullYear(),
    dataFim.getMonth(),
    dataFim.getDate() + 1,
    3, 59, 59, 999
  );

  const semanas = gerarSemanasParaCiclo(dataInicio, dataFim);

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

export async function getProximoCiclo(
  userId: string,
  referencia: Date,
  cicloAtual: boolean
) {
  // Função auxiliar → se dataFim cair até 03:59 do primeiro dia do mês,
  // ajusta para 23:59 do último dia do mês anterior
  function normalizarDataFim(dataFim: Date) {
    if (
      dataFim.getUTCDate() === 1 &&
      dataFim.getUTCHours() < 4
    ) {
      // joga 12h antes
      return new Date(dataFim.getTime() - 12 * 60 * 60 * 1000);
    }
    return dataFim;
  }


  const referenciaNormalizada = cicloAtual ? normalizarDataFim(referencia) : referencia;
  const ano = referenciaNormalizada.getUTCFullYear();
  const mes = referenciaNormalizada.getUTCMonth();

  const monthStart = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
  const nextMonthStart = new Date(Date.UTC(ano, mes + 1, 1, 0, 0, 0));
  const afterNextMonthStart = new Date(Date.UTC(ano, mes + 2, 1, 0, 0, 0));

  

  
  // 🚦 Fluxo A: estou em um ciclo
  if (cicloAtual) {
    // Procura próximo ciclo no mesmo mês
    const cicloMesmoMes = await prisma.ciclo.findFirst({
      where: {
        userId,
        dataInicio: {
          gt: referenciaNormalizada,
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      orderBy: { dataInicio: "asc" },
    });

    if (cicloMesmoMes) {
      return { ciclo: cicloMesmoMes, mesReferencia: referenciaNormalizada };
    }

    // Procura no próximo mês
    const cicloProximoMes = await prisma.ciclo.findFirst({
      where: {
        userId,
        dataInicio: {
          gte: nextMonthStart,
          lt: afterNextMonthStart,
        },
      },
      orderBy: { dataInicio: "asc" },
    });

    if (cicloProximoMes) {
      cicloProximoMes.dataFim = normalizarDataFim(cicloProximoMes.dataFim);
      return { ciclo: cicloProximoMes, mesReferencia: nextMonthStart };
    }

    // Se não tem ciclo → retorna mês vazio
    return { ciclo: null, mesReferencia: nextMonthStart };
  }

  // 🚦 Fluxo B: navegando sem ciclo
  const cicloNoProximoMes = await prisma.ciclo.findFirst({
    where: {
      userId,
      dataInicio: {
        gte: nextMonthStart,
        lt: afterNextMonthStart,
      },
    },
    orderBy: { dataInicio: "asc" },
  });

  if (cicloNoProximoMes) {
    return { ciclo: cicloNoProximoMes, mesReferencia: nextMonthStart };
  }
  
  return { ciclo: null, mesReferencia: nextMonthStart };
}


