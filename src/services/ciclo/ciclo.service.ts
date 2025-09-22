import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { prisma } from "@/lib/prisma";
import { TipoGasto } from "@prisma/client";

export async function getCicloById(cicloId: string) { 
    const ciclo = await prisma.ciclo.findUnique({ 
        where: {
            id: cicloId
        },
        include: {
            economias: {
                orderBy: {
                    createdAt: 'asc'
                }
            },
            gastos: {
                orderBy: {
                    createdAt: 'asc'
                }
            },
            semanas: {
                include: {
                    registros: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                }
            }
        }
    })

    return ciclo
}

export async function getCicloAtual(userId: string | undefined): Promise<CicloAtualDTO | null> {
    const ciclo = await prisma.ciclo.findFirst({
        where: {
            userId: userId,
            dataInicio: { lte: new Date() },
            dataFim: { gte: new Date() }
        },
        include: {
            economias: {
                orderBy: [
                    { createdAt: 'asc' },
                    { id: 'asc' } // desempate
                ],
            },
            gastos: {
                orderBy: [
                    { tipo: 'asc' },       // primeiro "unique", depois "goal"
                    { createdAt: 'asc' },  // dentro de cada tipo, pela ordem de criação
                    { id: 'asc' }          // desempate
                ]
            },
            semanas: {
                include: {
                    registros: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                }
            }
        }
    });

    if (!ciclo) return null
    
    const [somaEconomias, somaGastos, 
        somaEconomiaJaGuardada, somaGastosUnicosJaRealizados, 
        somaGastosPorMetaJaRealizados] = await Promise.all([
            prisma.economia.aggregate({
                where: { cicloId: ciclo.id },
                _sum: { valor: true }
            }),
            prisma.gasto.aggregate({
                where: { cicloId: ciclo.id },
                _sum: { valor: true }
            }),
            prisma.economia.aggregate({
                where: { cicloId: ciclo.id, isGuardado: true },
                _sum: { valor: true}
            }),
            prisma.gasto.aggregate({
                where: { cicloId: ciclo.id, tipo: "single", isPago: true},
                _sum: { valor: true}
            }),
            prisma.registroGasto.aggregate({
                where: { gasto: { cicloId: ciclo.id }},
                _sum: { valor: true}
            })
        ]
    )

    const economiasMesTotal = somaEconomias._sum.valor ?? 0
    const gastosMesTotal = somaGastos._sum.valor ?? 0
    const economiasJaGuardadas = somaEconomiaJaGuardada._sum.valor ?? 0
    const gastosUnicosJaRealizados = somaGastosUnicosJaRealizados._sum.valor ?? 0
    const gastosPorMetaJaRealizados = somaGastosPorMetaJaRealizados._sum.valor ?? 0
    const gastoTotalJaRealizado = gastosUnicosJaRealizados + gastosPorMetaJaRealizados
    const disponivelMes = ciclo.valorTotal - economiasJaGuardadas - gastoTotalJaRealizado
    
    // // Sempre criar a sobra do mes por padrão
    // const sobra = await prisma.gasto.findFirst({
    //     where: { cicloId: ciclo.id, isSobra: true }
    // })

    // if (!sobra) {
    //     await prisma.gasto.create({
    //         data: {
    //         name: "Sobra do mês",
    //         valor: ciclo.valorTotal - economiasMesTotal - gastosMesTotal,
    //         tipo: TipoGasto.goal,
    //         isSobra: true,
    //         cicloId: ciclo.id
    //         }
    //     })
    // }
    
    const registrosAgrupados = await prisma.registroGasto.groupBy({
        by: ["gastoId"],
        where: {
            gastoId: {
            in: (
                await prisma.gasto.findMany({
                where: { cicloId: ciclo.id },
                select: { id: true }
                })
            ).map(g => g.id)
            }
        },
        _sum: {
            valor: true
        }
    })

    const gastosPorMetaTotais = ciclo.gastos
        .filter(g => g.tipo === 'goal')
        .map(g => {
            const registro = registrosAgrupados.find(r => r.gastoId === g.id)
            const totalJaGasto =  registro?._sum.valor ?? 0
            return {
                ...g,
                totalPlanejado: g.valor,
                totalJaGasto,
                totalDisponivel: g.valor - totalJaGasto
            }
        })

    return {
        ...ciclo,
        economiasMesTotal,
        gastosMesTotal,
        economiasJaGuardadas,
        gastoTotalJaRealizado,
        disponivelMes,
        gastosPorMetaTotais
    }
}