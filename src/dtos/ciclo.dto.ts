import { Prisma } from "@prisma/client";

export type CicloAtualComRelacionamentos = Prisma.CicloGetPayload<{
  include: { economias: true; gastos: true; semanas: { include: { registros: true } } }
}>

// DTO específico pros gastos por meta enriquecidos
export type GastoPorMetaDTO = {
  id: string
  name: string
  valor: number
  tipo: string
  isPago: boolean
  createdAt: Date
  updatedAt: Date
  cicloId: string
  // 👇 novos campos calculados
  totalPlanejado: number
  totalJaGasto: number
  totalDisponivel: number
}

export type CicloAtualDTO = CicloAtualComRelacionamentos & {
    economiasMesTotal: number
    gastosMesTotal: number
    economiasJaGuardadas: number
    gastoTotalJaRealizado: number
    disponivelMes: number
    gastosPorMetaTotais: GastoPorMetaDTO[] // 👈 novo campo
}