import { editEconomiaSchema } from "@/dtos/economia.schema";
import { notFound, ok } from "@/lib/http";
import { deleteEconomiaService, editEconomiaService } from "@/services/economia/economia.service";
import { NextRequest, NextResponse } from "next/server";
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
    const economiaId = (await context.params).id

    // 2) parse/validação do body com Zod
    const body = await req.json();
    const parsed = editEconomiaSchema.parse(body); // lança ZodError se inválido
    
    // 3) 
    const valorCents = Math.round((parsed.valorCents ?? 0)); // garante number (não null)

    // // 4) salvar via service
    const economia = await editEconomiaService(economiaId, {...parsed, valorCents})

    if (!economia) return notFound()

    return ok("Economia alterada com sucesso");
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: zodErrorToMessage(err) }, { status: 422 });
    }
    if (err?.name === "AuthError") {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("API /economias error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string}>}) {
  const economiaId = (await context.params).id
  
  const economia = await deleteEconomiaService(economiaId)

  if (!economia) {
    return notFound()
  }

  return ok(economia)
}