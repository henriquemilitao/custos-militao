// app/api/economias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { created } from "@/lib/http";
import { createGastoSchema } from "@/dtos/gasto.schema";
import { createGastoService } from "@/services/gasto/gasto.service";

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
    console.log('a')
    const body = await req.json();
    console.log('b')
    console.log(body)
    const parsed = createGastoSchema.parse(body);
    console.log('c')
    const valorCents = Math.round(parsed.valorCents ?? 0);
    console.log('d')   

    const gasto = await createGastoService({
      ...parsed,
      valorCents,
    });
    console.log('e')   

    return created(gasto);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: zodErrorToMessage(err) }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}