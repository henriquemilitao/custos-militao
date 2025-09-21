import { NextRequest } from "next/server";
import { badRequest, notFound, ok, serverError } from "@/lib/http";
import { togglePagarGastoService } from "@/services/gasto/gasto.service";

export async function PATCH(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return badRequest();
  }

  try {
    const gasto = await togglePagarGastoService(id);

    if (!gasto) {
      return notFound();
    }

    return ok(gasto); // helper já retorna JSON + 200
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
