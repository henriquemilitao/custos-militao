import { z } from "zod";

export const createRegistroGastoSchema = z.object({
  name: z.string().min(1, "Descrição é obrigatória"),
  valorCents: z
    .number()
    .nullable()
    .refine((v) => v === null || v >= 0, "Valor inválido"),
  data: z.date().refine((d) => d !== null, {
    message: "Data é obrigatória",
  }),
  gastoId: z.string().uuid("gastoId inválido"),
  semanaId: z.string().uuid("semanaId inválido"),
});

export type CreateRegistroGastoDTO = z.infer<typeof createRegistroGastoSchema>;
