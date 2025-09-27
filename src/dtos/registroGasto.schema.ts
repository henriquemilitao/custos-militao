// dtos/registroGasto.schema.ts
import { z } from "zod";

export const createRegistroGastoSchema = z.object({
  name: z.string().min(1, { message: "Digite uma descrição" }),
  valorCents: z.number().refine((v) => v === null || v >= 0, { message: "Valor inválido" }),
  data: z.union([z.string(), z.date()])
    .transform((d) => new Date(d))
    .refine((d) => !isNaN(d.getTime()), { message: "Data inválida" }),
  gastoId: z.string().uuid({ message: "Categoria inválida" }),
  semanaId: z.string().uuid({ message: "Semana inválida" }),
  permission: z.boolean().optional(),
});

export type CreateRegistroGastoDTO = z.infer<typeof createRegistroGastoSchema>;

export const editRegistroGastoSchema = createRegistroGastoSchema.extend({
  // não precisa de gastoId fixo, já existe
  gastoId: z.string().uuid({ message: "Categoria inválida" }).optional(),
});

export type EditRegistroGastoDTO = z.infer<typeof editRegistroGastoSchema>;
