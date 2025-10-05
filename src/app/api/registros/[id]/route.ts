import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { editRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { deleteRegistroGastoService, editRegistroGastoService } from "@/services/registroGasto/registroGasto.service";
import { notFound } from "@/lib/http";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string}>} ) {
  try {
    const registroId = (await context.params).id

    const body = await req.json();
    const parsed = editRegistroGastoSchema.parse(body);
    const valorCents = Math.round(parsed.valorCents ?? 0);

    console.log({bbbbbbbb: parsed.gastoId})
    const result = await editRegistroGastoService(registroId, {
      ...parsed,
      valorCents,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, type: result.type },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message) }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string}>}) {
  const registroId = (await context.params).id

  const registro = await deleteRegistroGastoService(registroId)

  if (!registro) {
    return notFound()
  }

  return NextResponse.json(registro, { status: 200 });
}
