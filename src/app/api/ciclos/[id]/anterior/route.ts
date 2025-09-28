import { notFound, ok } from "@/lib/http";
import { getCicloAnterior } from "@/services/ciclo/ciclo.service";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const { id: cicloId } = context.params;
  const userId = "978dbd3e-ff8c-4344-90af-0be8e53a9346"; // ajustar com auth

  const anterior = await getCicloAnterior(userId, cicloId);
  if (!anterior) return notFound();

  return ok(anterior);
}
