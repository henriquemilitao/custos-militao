import { NextRequest, NextResponse } from "next/server";
import { toggleGuardarEconomiaService } from "@/services/economia/economia.service";
import { badRequest, notFound, ok, serverError } from "@/lib/http";

export async function PATCH(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return badRequest();
  }

  try {
    const economia = await toggleGuardarEconomiaService(id);

    if (!economia) {
      return notFound();
    }

    return ok(economia); // helper já retorna JSON + 200
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
