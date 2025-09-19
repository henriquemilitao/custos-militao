// dtos/economia.schema.ts
import { z } from "zod";

export const createEconomiaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  // aceita número (ex: 12.34) ou null (campo vazio no input)
  valor: z.number().nullable().refine(v => v === null || v >= 0, "Valor inválido"),
  // cicloId é obrigatório no seu prisma.schema (cicloId String)
  cicloId: z.string().uuid("cicloId inválido"),
});

export type CreateEconomiaDTO = z.infer<typeof createEconomiaSchema>;
