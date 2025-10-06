import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarSemanasParaCiclo, getMesAtualTimeZone } from "./utils";
import { syncAleatorio } from "../aleatorio/aleatorio.service";

export type CicloComMes = {
  ciclo: CicloAtualDTO | null;
  dataInicio: string;
  dataFim: string;
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

// // ciclo imediatamente anterior
// export async function getCicloAnterior(userId: string, cicloId: string) {
//   const cicloAtual = await prisma.ciclo.findUnique({ where: { id: cicloId } });
//   if (!cicloAtual) return null;

//   return prisma.ciclo.findFirst({
//     where: {
//       userId,
//       dataFim: { lt: cicloAtual.dataInicio },
//     },
//     orderBy: { dataFim: "desc" },
//   });
// }

export async function createCicloByValorTotalService(params: {
  valorCents: number | null;
  dataInicio: string;
  dataFim: string
  req: Request;
}) {
  const { valorCents, dataInicio, dataFim, req } = params;
  console.log('TO NO SERVICE DE CRIAR CICLO E TENHO ISSO::::')
  console.log({ valorCents, req })
  
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // pega início e fim do mês
  // let { dataInicio, dataFim } = getMesAtualTimeZone("America/Campo_Grande");

  // padroniza início e fim no esquema 04:00 -> 03:59
  // dataInicio = new Date(
  //   dataInicio.getFullYear(),
  //   dataInicio.getMonth(),
  //   dataInicio.getDate(),
  //   4, 0, 0, 0
  // );

  // dataFim = new Date(
  //   dataFim.getFullYear(),
  //   dataFim.getMonth(),
  //   dataFim.getDate() + 1,
  //   3, 59, 59, 999
  // );

  const semanas = gerarSemanasParaCiclo(new Date(dataInicio), new Date(dataFim));

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

// export async function getcicloAnteriorAntigo(
//   userId: string,
//   referencia: Date,
//   cicloAtual: boolean
// ): Promise<CicloComMes> {
//   function normalizarDataFim(dataFim: Date) {
//     if (dataFim.getUTCDate() === 1 && dataFim.getUTCHours() < 4) {
//       return new Date(dataFim.getTime() - 12 * 60 * 60 * 1000);
//     }
//     return dataFim;
//   }

//   const referenciaNormalizada = cicloAtual ? normalizarDataFim(referencia) : referencia;
//   const ano = referenciaNormalizada.getUTCFullYear();
//   const mes = referenciaNormalizada.getUTCMonth();

//   const monthStart = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
//   const nextMonthStart = new Date(Date.UTC(ano, mes + 1, 1, 0, 0, 0));
//   const afterNextMonthStart = new Date(Date.UTC(ano, mes + 2, 1, 0, 0, 0));

//   // <-- aqui a tipagem correta evita `any`
//   let ciclo: CicloAtualComRelacionamentos | null = null;
//   let mesReferencia: Date = nextMonthStart;

//   if (cicloAtual) {
//     ciclo = await prisma.ciclo.findFirst({
//       where: {
//         userId,
//         dataInicio: {
//           gt: referenciaNormalizada,
//           gte: monthStart,
//           lt: nextMonthStart,
//         },
//       },
//       include: {
//         economias: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
//         gastos: { orderBy: [{ tipo: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
//         semanas: { include: { registros: { orderBy: { createdAt: "asc" } } } },
//       },
//       orderBy: { dataInicio: "asc" },
//     }) as CicloAtualComRelacionamentos | null;

//     if (!ciclo) {
//       ciclo = await prisma.ciclo.findFirst({
//         where: {
//           userId,
//           dataInicio: { gte: nextMonthStart, lt: afterNextMonthStart },
//         },
//         include: {
//           economias: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
//           gastos: { orderBy: [{ tipo: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
//           semanas: { include: { registros: { orderBy: { createdAt: "asc" } } } },
//         },
//         orderBy: { dataInicio: "asc" },
//       }) as CicloAtualComRelacionamentos | null;

//       mesReferencia = nextMonthStart;
//       if (ciclo) ciclo.dataFim = normalizarDataFim(ciclo.dataFim);
//     }
//   } else {
//     ciclo = await prisma.ciclo.findFirst({
//       where: {
//         userId,
//         dataInicio: { gte: nextMonthStart, lt: afterNextMonthStart },
//       },
//       include: {
//         economias: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
//         gastos: { orderBy: [{ tipo: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
//         semanas: { include: { registros: { orderBy: { createdAt: "asc" } } } },
//       },
//       orderBy: { dataInicio: "asc" },
//     }) as CicloAtualComRelacionamentos | null;

//     mesReferencia = nextMonthStart;
//   }

//   if (!ciclo) {
//     return { ciclo: null, mesReferencia: mesReferencia.toISOString() };
//   }

//   // --- mesmo cálculo do getCicloAtual ---
//   const [
//     somaEconomias,
//     somaGastos,
//     somaEconomiaJaGuardada,
//     somaGastosUnicosJaRealizados,
//     somaGastosPorMetaJaRealizados,
//   ] = await Promise.all([
//     prisma.economia.aggregate({ where: { cicloId: ciclo.id }, _sum: { valor: true } }),
//     prisma.gasto.aggregate({ where: { cicloId: ciclo.id }, _sum: { valor: true } }),
//     prisma.economia.aggregate({ where: { cicloId: ciclo.id, isGuardado: true }, _sum: { valor: true } }),
//     prisma.gasto.aggregate({ where: { cicloId: ciclo.id, tipo: "single", isPago: true }, _sum: { valor: true } }),
//     prisma.registroGasto.aggregate({ where: { gasto: { cicloId: ciclo.id } }, _sum: { valor: true } }),
//   ]);

//   const economiasMesTotal = somaEconomias._sum.valor ?? 0;
//   const gastosMesTotal = somaGastos._sum.valor ?? 0;
//   const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0;
//   const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0;
//   const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0;
//   const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados;
//   const disponivelMes = ciclo.valorTotal * 100 - economiasJaGuardadas - gastoTotalJaRealizado;

//   const registrosAgrupados = await prisma.registroGasto.groupBy({
//     by: ["gastoId"],
//     where: { gastoId: { in: ciclo.gastos.map((g) => g.id) } },
//     _sum: { valor: true },
//   });

//   // aqui o TS sabe que `g` tem o tipo correto (vindo do CicloAtualComRelacionamentos)
//   const gastosPorMetaTotais = ciclo.gastos
//     .filter((g) => g.tipo === "goal")
//     .map((g) => {
//       const registro = registrosAgrupados.find((r) => r.gastoId === g.id);
//       const totalJaGasto = registro?._sum.valor ?? 0;
//       return {
//         ...g,
//         totalPlanejado: g.valor,
//         totalJaGasto,
//         totalDisponivel: g.valor - totalJaGasto,
//       };
//     });

//   return {
//     ciclo: {
//       ...ciclo,
//       economiasMesTotal,
//       gastosMesTotal,
//       economiasJaGuardadas,
//       gastoTotalJaRealizado,
//       disponivelMes,
//       gastosPorMetaTotais,
//     },
//     mesReferencia: mesReferencia.toISOString(),
//   };
// }


export async function getCicloAtual(userId: string | undefined, dataInicio: string, dataFim: string) {
  const hoje = new Date();

  let ciclo;
  console.log('TO NO INICIOOOOOO SERVICEEEEEEEEEEEE CICLO ATUALLLLL')
  console.log('Chegou essas datas')
  console.log({dataInicio, dataFim})
  if (dataInicio && dataFim) {
    ciclo = await prisma.ciclo.findFirst({
      where: {
        userId,
        dataInicio: { equals: new Date(dataInicio) },
        dataFim: { equals: new Date(dataFim) },
      },
      include: {
        economias: { 
          orderBy: [
            { isGuardado: "desc" }, 
            { nome: "asc" }
          ], 
        },
        gastos: {
          orderBy: [
            { tipo: "asc" },
            { isPago: "desc" },
            { name: "asc"},
          ],
        },
        semanas: {
          include: {
            registros: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });
  } else {
    ciclo = await prisma.ciclo.findFirst({
      where: {
        userId,
        dataInicio: { lte: hoje },
        dataFim: { gte: hoje },
      },
      include: {
        economias: { 
          orderBy: [
            { isGuardado: "desc" }, 
            { nome: "asc" }
          ], 
        },
        gastos: {
          orderBy: [
            { tipo: "asc" },
            { isPago: "desc" },
            { name: "asc"},
          ],
        },
        semanas: {
          include: {
            registros: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });
  }
  console.log('TO NO BBBBBBBB SERVICEEEEEEEEEEEE')

  if (!ciclo) {
    // Nenhum ciclo encontrado → retorna null + mês de hoje
    console.log('TO NO CCCCCCCC SERVICEEEEEEEEEEEE')
    return {
      ciclo: null,
      dataInicio,
      dataFim
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
  console.log('TO NO DDDDDDDD SERVICEEEEEEEEEEEE')

  const economiasMesTotal = somaEconomias._sum.valor ?? 0;
  const gastosMesTotal = somaGastos._sum.valor ?? 0;
  const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0;
  const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0;
  const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0;
  const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados;
  const disponivelMes = (ciclo.valorTotal * 100 - economiasJaGuardadas - gastoTotalJaRealizado);
  console.log('TO NO EEEEEEEE SERVICEEEEEEEEEEEE')

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
  console.log('TO NO FFFFFFFF SERVICEEEEEEEEEEEE')

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
  console.log('TO NO GGGGGGGG SERVICEEEEEEEEEEEE')

  await syncAleatorio(ciclo.id);
  console.log('TO NO HHHHHHHHHHHH SERVICEEEEEEEEEEEE')

  console.log('TO NO FIMMMMMM SERVICEEEEEEEEEEEE')
  console.log({
    dataINICIOMesQueChegouNoMutation: dataInicio,
    dataFIMMesQueChegouNoMutation: dataFim,
    dataINICIODoMesQueTaNoCicloQueTaMostrando: ciclo.dataInicio,
    dataFIMDoMesQueTaNoCicloQueTaMostrando: ciclo.dataFim
  })

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
    dataInicio: ciclo.dataInicio.toISOString(),
    dataFim: ciclo.dataFim.toISOString()
  };
}


function normalizarDatas(dataInicio: Date, dataFim: Date) {
  const inicioNormalizado = new Date(
    dataInicio.getFullYear(),
    dataInicio.getMonth(),
    dataInicio.getDate(),
    4, 0, 0, 0
  );

  const fimNormalizado = new Date(
    dataFim.getFullYear(),
    dataFim.getMonth(),
    dataFim.getDate(),
    3, 59, 59, 999
  );

  return { inicioNormalizado, fimNormalizado };
}

export async function getProximoCiclo(params: {
  userId: string,
  dataInicio: string,
  dataFim: string,
}) {
  const { userId, dataInicio, dataFim } = params;

  const inicioDate = new Date(dataInicio);
  const fimDate = new Date(dataFim);

  if (isNaN(fimDate.getTime()) || isNaN(inicioDate.getTime())) {
    throw new Error("Datas inválidas");
  }

  console.log("DATAS Q CHEGARAM NO SERVICE PROXIMO CICLOOOOOO");
  console.log({ dataInicio, dataFim });

  // cria as datas de 1 mês à frente
  const inicioProxMes = new Date(inicioDate);
  inicioProxMes.setMonth(inicioProxMes.getMonth() + 1);

  const fimProxMes = new Date(fimDate);
  fimProxMes.setMonth(fimProxMes.getMonth() + 1);

  console.log("PERÍODO QUE SERÁ BUSCADO NO BANCO (1 mês à frente):");
  console.log({ inicioProxMes, fimProxMes });

  // procura ciclo dentro desse novo intervalo (1 mês à frente)
  const proximoCiclo = await prisma.ciclo.findFirst({
    where: {
      userId,
      dataInicio: {
        gte: inicioProxMes,
        lte: fimProxMes,
      },
    },
    orderBy: { dataInicio: "asc" },
    include: {
      economias: { orderBy: [{ isGuardado: "desc" }, { nome: "asc" }] },
      gastos: {
        orderBy: [
          { tipo: "asc" },
          { isPago: "desc" },
          { name: "asc" },
        ],
      },
      semanas: {
        include: { registros: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  // se existir ciclo no intervalo (1 mês à frente)
  if (proximoCiclo) {
    const [
      somaEconomias,
      somaGastos,
      somaEconomiaJaGuardada,
      somaGastosUnicosJaRealizados,
      somaGastosPorMetaJaRealizados,
    ] = await Promise.all([
      prisma.economia.aggregate({ where: { cicloId: proximoCiclo.id }, _sum: { valor: true } }),
      prisma.gasto.aggregate({ where: { cicloId: proximoCiclo.id }, _sum: { valor: true } }),
      prisma.economia.aggregate({ where: { cicloId: proximoCiclo.id, isGuardado: true }, _sum: { valor: true } }),
      prisma.gasto.aggregate({ where: { cicloId: proximoCiclo.id, tipo: "single", isPago: true }, _sum: { valor: true } }),
      prisma.registroGasto.aggregate({ where: { gasto: { cicloId: proximoCiclo.id } }, _sum: { valor: true } }),
    ]);

    const economiasMesTotal = somaEconomias._sum.valor ?? 0;
    const gastosMesTotal = somaGastos._sum.valor ?? 0;
    const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0;
    const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0;
    const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0;
    const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados;
    const disponivelMes = proximoCiclo.valorTotal * 100 - economiasJaGuardadas - gastoTotalJaRealizado;

    const registrosAgrupados = await prisma.registroGasto.groupBy({
      by: ["gastoId"],
      where: { gastoId: { in: proximoCiclo.gastos.map((g) => g.id) } },
      _sum: { valor: true },
    });

    const gastosPorMetaTotais = proximoCiclo.gastos
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

    console.log("ACHEI UM CICLO DENTRO DO PRÓXIMO MÊS!");

    const { inicioNormalizado, fimNormalizado } = normalizarDatas(
      proximoCiclo.dataInicio,
      proximoCiclo.dataFim
    );

    return {
      ciclo: {
        ...proximoCiclo,
        economiasMesTotal,
        gastosMesTotal,
        economiasJaGuardadas,
        gastoTotalJaRealizado,
        disponivelMes,
        gastosPorMetaTotais,
      },
      dataInicio: inicioNormalizado.toISOString(),
      dataFim: fimNormalizado.toISOString(),
    };
  }

  console.log("NENHUM CICLO ENCONTRADO NO PRÓXIMO MÊS.");

  // se não existe ciclo → devolve "ciclo null" e datas 1 mês pra frente
  const { inicioNormalizado, fimNormalizado } = normalizarDatas(inicioProxMes, fimProxMes);

  return {
    ciclo: null,
    dataInicio: inicioNormalizado.toISOString(),
    dataFim: fimNormalizado.toISOString(),
  };
}


export async function getCicloAnterior(params: {
  userId: string,
  dataInicio: string,
  dataFim: string,
}) {
  const { userId, dataInicio, dataFim } = params;
  console.log('DATAS Q CHEGARAM NO SERVICEEEEEEEEEE ANTERIORRRRRRRRRRRRRR')
  console.log('---------------------------------------')

  console.log({dataInicio, dataFim})
  console.log('---------------------------------------')
  

  // // converte as strings ISO em Date
  // const inicioDate = new Date(dataInicio);
  // const fimDate = new Date(dataFim);
  // console.log('DATAS NORMALIZADAS SERVICE')
  // console.log('---------------------------------------')

  // console.log({inicioDate, fimDate})
  // console.log('---------------------------------------')
  // if (isNaN(fimDate.getTime())) {
  //   throw new Error("dataFim inválida");
  // }
  // console.log('TO NO BBBBBBBBBBBBBBB PROXIMO SERVICEEEEEEEEEEEE')


  const inicioDate = new Date(dataInicio);
  const fimDate = new Date(dataFim);

  if (isNaN(fimDate.getTime()) || isNaN(inicioDate.getTime())) {
    throw new Error("Datas inválidas");
  }

  console.log("DATAS Q CHEGARAM NO SERVICE ANTERIOR CICLOOOOOO");
  console.log({ dataInicio, dataFim });

  // cria as datas de 1 mês à frente
  const inicioMesAnterior = new Date(inicioDate);
  inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);

  const fimMesAnterior = new Date(fimDate);
  fimMesAnterior.setMonth(fimMesAnterior.getMonth() - 1);


  // procura ciclo que começa depois do fim atual
  const cicloAnterior = await prisma.ciclo.findFirst({
    where: {
      userId,
      dataInicio: {
        gte: inicioMesAnterior,
        lte: fimMesAnterior,
      },
    },
    orderBy: { dataInicio: "desc" },
    include: {
      economias: { orderBy: [{ isGuardado: "desc" }, { nome: "asc" }] },
      gastos: {
        orderBy: [
          { tipo: "asc" },
          { isPago: "desc" },
          { name: "asc" },
        ],
      },
      semanas: {
        include: { registros: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  console.log('TO NO CCCCCCCCCCCCCCCCCC PROXIMO SERVICEEEEEEEEEEEE')
  console.log('CICLO QUE EU PESQUISEI COM ESSAS RESPOSTAS FOIIIIII')
  console.log({cicloAnterior})


  // caso exista ciclo no futuro → retorna ele e suas datas
  if (cicloAnterior) {
    console.log('TO NO DDDDDDDDDDDDDDD PROXIMO SERVICEEEEEEEEEEEE')

    const [
      somaEconomias,
      somaGastos,
      somaEconomiaJaGuardada,
      somaGastosUnicosJaRealizados,
      somaGastosPorMetaJaRealizados,
    ] = await Promise.all([
      prisma.economia.aggregate({ where: { cicloId: cicloAnterior.id }, _sum: { valor: true } }),
      prisma.gasto.aggregate({ where: { cicloId: cicloAnterior.id }, _sum: { valor: true } }),
      prisma.economia.aggregate({ where: { cicloId: cicloAnterior.id, isGuardado: true }, _sum: { valor: true } }),
      prisma.gasto.aggregate({ where: { cicloId: cicloAnterior.id, tipo: "single", isPago: true }, _sum: { valor: true } }),
      prisma.registroGasto.aggregate({ where: { gasto: { cicloId: cicloAnterior.id } }, _sum: { valor: true } }),
    ]);

    const economiasMesTotal = somaEconomias._sum.valor ?? 0;
    const gastosMesTotal = somaGastos._sum.valor ?? 0;
    const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0;
    const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0;
    const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0;
    const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados;
    const disponivelMes = cicloAnterior.valorTotal * 100 - economiasJaGuardadas - gastoTotalJaRealizado;

    const registrosAgrupados = await prisma.registroGasto.groupBy({
      by: ["gastoId"],
      where: { gastoId: { in: cicloAnterior.gastos.map((g) => g.id) } },
      _sum: { valor: true },
    });

    const gastosPorMetaTotais = cicloAnterior.gastos
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
    console.log('TO NO FFFFFFFFFFF PROXIMO SERVICEEEEEEEEEEEE')

    const { inicioNormalizado, fimNormalizado } = normalizarDatas(
      cicloAnterior.dataInicio,
      cicloAnterior.dataFim
    );

    console.log({
      proxCicloInicio: cicloAnterior.dataInicio,
      proxCicloFim: cicloAnterior.dataFim,
      inicioNormalizado,
      fimNormalizado
    })
  console.log('TO NO GGGGGGGGGGGG PROXIMO SERVICEEEEEEEEEEEE')

    return {
      ciclo: {
        ...cicloAnterior,
        economiasMesTotal,
        gastosMesTotal,
        economiasJaGuardadas,
        gastoTotalJaRealizado,
        disponivelMes,
        gastosPorMetaTotais,
      },
      dataInicio: inicioNormalizado.toISOString(),
      dataFim: fimNormalizado.toISOString(),
    };
  }
  console.log('dddd')

  // se não existe ciclo → devolve "ciclo null" e datas 1 mês pra frente
  const proxInicio = new Date(dataInicio);
  proxInicio.setMonth(proxInicio.getMonth() - 1);
  
  const proxFim = new Date(dataFim);
  proxFim.setMonth(proxFim.getMonth() - 1);

  const { inicioNormalizado, fimNormalizado } = normalizarDatas(proxInicio, proxFim);

  console.log('VOU PASSAR PRO FRONT O CICLO ANTERIOR QUE É::::')
  console.log({inicioNormalizado, fimNormalizado})
  return {
    ciclo: null,
    dataInicio: inicioNormalizado.toISOString(),
    dataFim: fimNormalizado.toISOString(),
  };
}