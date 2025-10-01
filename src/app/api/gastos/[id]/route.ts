import { editGastoSchema } from "@/dtos/gasto.schema";
import { notFound, ok } from "@/lib/http"
import { deleteGastoService, editGastoService } from "@/services/gasto/gasto.service"
import { NextRequest, NextResponse } from "next/server"
import { ZodError, ZodIssue } from "zod";

function zodErrorToMessage(err: ZodError) {
  return err.issues
    .map((issue: ZodIssue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join(" | ");
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string}>} ) {
  try {
    const gastoId = (await context.params).id

    // 2) parse/validação do body com Zod
    const body = await req.json();
    const parsed = editGastoSchema.parse(body); // lança ZodError se inválido
    
    // 3) 
    const valorCents = Math.round((parsed.valorCents ?? 0)); // garante number (não null)

    // // 4) salvar via service
    const gasto = await editGastoService(gastoId, {...parsed, valorCents})

    if (!gasto) return notFound()

    return NextResponse.json(gasto, { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: zodErrorToMessage(err) }, { status: 422 });
    }
    // if (err?.name === "AuthError") {
    //   return NextResponse.json({ error: err.message }, { status: 401 });
    // }
    console.error("API /gastos error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string}>}) {
  const gastoId = (await context.params).id

  const gasto = await deleteGastoService(gastoId)

  if (!gasto) {
    return notFound()
  }

  return NextResponse.json(gasto, { status: 200 });
}
