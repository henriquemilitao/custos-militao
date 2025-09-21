import { Prisma } from "@prisma/client";

export type CicloAtualComRelacionamentos = Prisma.CicloGetPayload<{
  include: { economias: true; gastos: true; semanas: { include: { registros: true } } }
}>

export type CicloAtualDTO = CicloAtualComRelacionamentos & {
    economiasMesTotal: number
    gastosMesTotal: number
    economiasJaGuardadas: number
    gastoTotalJaRealizado: number
    disponivelMes: number
}