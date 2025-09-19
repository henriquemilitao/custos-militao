import { prisma } from "@/lib/prisma";

export async function getCicloById(cicloId: string) { 
    const ciclo = await prisma.ciclo.findUnique({ 
        where: {
            id: cicloId
        },
        include: {
            economias: true,
            gastos: true,
            semanas: {
                include: {
                    registros: true
                }
            }
        }
    })

    return ciclo
}