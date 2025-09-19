// app/api/economias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { createEconomiaSchema } from "@/dtos/economia.schema";
import { verifyTokenFromRequest, AuthError } from "@/lib/auth";
import { createEconomiaService } from "@/services/economia.service";

function zodErrorToMessage(err: ZodError) {
  return err.issues
    .map((issue: ZodIssue) => {
      const path = issue.path.length ? issue.path.join(".") : "body";
      return `${path}: ${issue.message}`;
    })
    .join(" | ");
}

export async function POST(req: NextRequest) {
  try {
    // 1) autenticação (opcional para dev) - tenta pegar userId do token
    // let userId: string | null = null;
    // try {
    //   const payload = verifyTokenFromRequest(req); // se não tiver token pode lançar AuthError
    //   userId = (payload as any)?.sub ?? null;
    // } catch (authErr: any) {
    //   // ATENÇÃO:
    //   // Por enquanto, não exigimos token (modo dev). Em produção, mude para:
    //   // throw authErr;
    //   userId = null;
    // }



    // 2) parse/validação do body com Zod
    const body = await req.json();
    const parsed = createEconomiaSchema.parse(body); // lança ZodError se inválido
    console.log(body.valor)
    // 3) transformar valor (reais -> cents). parsed.valor pode ser number ou null
    const valorCents = Math.round((parsed.valor ?? 0) * 100); // garante number (não null)

    // // 4) salvar via service
    const economia = await createEconomiaService({...parsed, valorCents: parsed.valor})

    return NextResponse.json({ status: 201 });
  } catch (err: any) {
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
