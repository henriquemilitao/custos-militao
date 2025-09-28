import { notFound, ok } from "@/lib/http";
import { getCicloProximo } from "@/services/ciclo/ciclo.service";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const { id: cicloId } = context.params;
  const userId = "978dbd3e-ff8c-4344-90af-0be8e53a9346"; // ajustar com auth
  const proximo = await getCicloProximo(userId, cicloId);
  if (!proximo) return notFound();

  return ok(proximo);
}
