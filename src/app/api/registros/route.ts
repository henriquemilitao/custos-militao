import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { createRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { createRegistroGastoService } from "@/services/registroGasto/registroGasto.service";
import { created } from "@/lib/http";

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
    console.log(body)
    const parsed = createRegistroGastoSchema.parse({
      ...body,
      data: new Date(body.data)
    });

    // garantir que não venha float do front
    const valorCents = Math.round(parsed.valorCents ?? 0);

    const registro = await createRegistroGastoService({
      ...parsed,
      valorCents,
    });

    return created(registro);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: zodErrorToMessage(err) },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
