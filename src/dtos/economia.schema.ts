import { z } from "zod";

export const createEconomiaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valorCents: z.number().nullable().refine(v => v === null || v >= 0, "Valor inválido"),
  cicloId: z.string().uuid("cicloId inválido"), // obrigatório só no create
});

export const editEconomiaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valorCents: z.number().nullable().refine(v => v === null || v >= 0, "Valor inválido"),
  // sem cicloId
});

export type CreateEconomiaDTO = z.infer<typeof createEconomiaSchema>;
export type EditEconomiaDTO = z.infer<typeof editEconomiaSchema>;