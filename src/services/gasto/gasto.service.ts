// src/services/gasto/gasto.service.ts
import { prisma } from "@/lib/prisma";
import { TipoGasto } from "@prisma/client";

export type GastoWithRegistrosSum = {
  id: string;
  name: string;
  valor: number;
  tipo: string; // 'single' | 'goal' (ou variantes)
  isPago?: boolean | null;
  dataPago?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  registrosTotal: number; // soma dos registros (0 se nenhum)
};

export async function getGastosByCicloId(cicloId: string): Promise<GastoWithRegistrosSum[]> {
  if (!cicloId) return [];

  // 1) pega todos os gastos do ciclo (ordenados)
  const gastos = await prisma.gasto.findMany({
    where: { cicloId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      valor: true,
      tipo: true,
      isPago: true,
      dataPago: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 2) soma registros agrupando por gastoId — filtrando para registros cujos gastos pertençam a esse ciclo
  const grupos = await prisma.registroGasto.groupBy({
    by: ["gastoId"],
    where: {
      gasto: { cicloId },
    },
    _sum: {
      valor: true,
    },
  });

  const mapaSoma = new Map<string, number>(
    grupos.map((g) => [g.gastoId, (g._sum.valor ?? 0)])
  );

  // 3) anexa a soma a cada gasto
  return gastos.map((g) => ({
    ...g,
    registrosTotal: mapaSoma.get(g.id) ?? 0,
  }));
}

export async function createGastoService(params: {
  nome: string;
  valorCents: number | null;
  cicloId: string;
  tipoGasto: TipoGasto
}) {
  const { nome, valorCents, cicloId, tipoGasto } = params;

  return prisma.gasto.create({
    data: {
      name: nome,
      valor: valorCents ?? 0, // null vira 0
      isPago: false,
      tipo: tipoGasto,
      cicloId,
    },
  });
}


export async function editGastoService(
  gastoId: string,
  params: { name: string; valorCents: number | null; tipoGasto: TipoGasto }
) {
  const { name, valorCents, tipoGasto } = params;

  const gasto = await prisma.gasto.findUnique({ where: { id: gastoId } });
  if (!gasto) return null;

  // Caso específico: único pago -> recorrente
  if (gasto.tipo === TipoGasto.single && tipoGasto === TipoGasto.goal && gasto.isPago) {
    await prisma.$transaction([
      prisma.registroGasto.create({
        data: {
          name: gasto.name,
          gastoId: gasto.id,
          valor: gasto.valor,
          data: gasto.dataPago ?? new Date(),
          semanaId: 'e88d8ed1-aafc-470a-b0f8-d7dc6c5ac217' //ALTERAR ESSA MERDA DEPOIS PQP
           //ALTERAR ESSA MERDA DEPOIS PQP
            //ALTERAR ESSA MERDA DEPOIS PQP
             //ALTERAR ESSA MERDA DEPOIS PQP
              //ALTERAR ESSA MERDA DEPOIS PQP
               //ALTERAR ESSA MERDA DEPOIS PQP
                //ALTERAR ESSA MERDA DEPOIS PQP
                 //ALTERAR ESSA MERDA DEPOIS PQP
                  //ALTERAR ESSA MERDA DEPOIS PQP
                   //ALTERAR ESSA MERDA DEPOIS PQP
                    //ALTERAR ESSA MERDA DEPOIS PQP
                     //ALTERAR ESSA MERDA DEPOIS PQP
                      //ALTERAR ESSA MERDA DEPOIS PQP
        },
      }),
      prisma.gasto.update({
        where: { id: gastoId },
        data: {
          name,
          valor: valorCents ?? 0,
          tipo: tipoGasto,
          isPago: false,
          dataPago: null,
        },
      }),
    ]);

    return { 
      ...gasto, 
      valor: valorCents,
      tipo: tipoGasto,
      isPago: false,
      dataPago: null
    };
  }

  // Demais casos normais
  return prisma.gasto.update({
    where: { id: gastoId },
    data: {
      name,
      valor: valorCents ?? 0,
      tipo: tipoGasto,
    },
  });
}



export async function togglePagarGastoService(gastoId: string) {
  const gasto = await prisma.gasto.findUnique({
    where: { id: gastoId },
  });

  if (!gasto) return null;

  return prisma.gasto.update({
    where: {
      id: gastoId
    },
    data: {
      isPago: !gasto.isPago,
      dataPago: gasto.isPago ? null : new Date()
    }
  })
}

export async function deleteGastoService(gastoId: string){
  return prisma.gasto.delete({
    where: {id: gastoId}
  });
}