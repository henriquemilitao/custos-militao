import { notFound, serverError } from "@/lib/http"
import { getCicloById, updateCicloValorTotalService } from "@/services/ciclo/ciclo.service"
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

export async function GET(_: NextRequest, context: { params: Promise<{ id: string}>} ) {
    const cicloId = (await context.params).id

    try {
        const ciclo = await getCicloById(cicloId)
        if (!ciclo) {
            return notFound()
        }
        return NextResponse.json({
            ...ciclo, 
            valorTotal: Number(ciclo.valorTotal)
        },    
        {status: 200})

    } catch (error) {
        console.log(error)
        return serverError()
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string}>} ) {
  try {
    const cicloId = (await context.params).id

    // 2) parse/validação do body com Zod
    const body = await req.json();

    // 3)
    // const valorCents = Math.round((body.valorCents ?? 0)); // garante number (não null)

    // // 4) salvar via service
    const ciclo = await updateCicloValorTotalService({
        cicloId, 
        valorCents: body.valorCents, 
        req
    });
    
    if (!ciclo) return notFound()

    return NextResponse.json(ciclo, { status: 200 });

  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: zodErrorToMessage(err) }, { status: 422 });
    }
    // if (err?.name === "AuthError") {
    //   return NextResponse.json({ error: err.message }, { status: 401 });
    // }
    console.error("API /economias error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}