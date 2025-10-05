// app/api/economias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { createEconomiaSchema } from "@/dtos/economia.schema";
import { createEconomiaService } from "@/services/economia/economia.service";

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
    const body = await req.json();
    const parsed = createEconomiaSchema.parse(body);
    
    const valorCents = Math.round(parsed.valorCents ?? 0);

    const economia = await createEconomiaService({
      ...parsed,
      valorCents,
    });

    return NextResponse.json(economia, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: zodErrorToMessage(err) }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}