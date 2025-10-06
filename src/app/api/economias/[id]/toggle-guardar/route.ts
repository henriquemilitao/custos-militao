import { NextRequest, NextResponse } from "next/server";
import { toggleGuardarEconomiaService } from "@/services/economia/economia.service";
import { badRequest, notFound, serverError } from "@/lib/http";

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

    return NextResponse.json(economia, { status: 200 });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
