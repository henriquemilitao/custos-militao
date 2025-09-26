import { TipoGasto } from "@prisma/client";
import { z } from "zod";

export const createGastoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"), //ALTERAR ISSO PRA NAME DEPOISSSSSSSSSSSSSSSSS
  valorCents: z.number().nullable().refine(v => v === null || v >= 0, "Valor inválido"),
  cicloId: z.string().uuid("cicloId inválido"), // obrigatório só no create
  tipoGasto: z.nativeEnum(TipoGasto).refine(
    (v) => Object.values(TipoGasto).includes(v),
    { message: "Tipo de gasto inválido" }
  ),
});

export const editGastoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  valorCents: z
    .number()
    .nullable()
    .refine((v) => v === null || v >= 0, "Valor inválido"),
  tipoGasto: z.nativeEnum(TipoGasto).refine(
    (v) => Object.values(TipoGasto).includes(v),
    { message: "Tipo de gasto inválido" }
  ),
});

export type CreateGastoDTO = z.infer<typeof createGastoSchema>;
export type EditGastoDTO = z.infer<typeof editGastoSchema>;