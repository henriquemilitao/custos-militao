import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { prisma } from "@/lib/prisma";

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
            dataInicio: {lte: new Date()},
            dataFim: {gte: new Date()}
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

    if (!ciclo) return null

    const [somaEconomias, somaGastos] = await Promise.all([
        prisma.economia.aggregate({
            where: { cicloId: ciclo.id },
            _sum: { valor: true }
        }),
        prisma.gasto.aggregate({
            where: { cicloId: ciclo.id },
            _sum: { valor: true }
        })
    ])

    const economiasMesTotal = somaEconomias._sum.valor ?? 0
    const gastosMesTotal = somaGastos._sum.valor ?? 0
    
    return {
        ...ciclo,
        economiasMesTotal,
        gastosMesTotal,
        disponivelMes: ciclo.valorTotal - economiasMesTotal - gastosMesTotal
    }
}