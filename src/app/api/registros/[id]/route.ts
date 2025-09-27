import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { editRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { editRegistroGastoService } from "@/services/registroGasto/registroGasto.service";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string}>} ) {
  try {
    const registroId = (await context.params).id

    const body = await req.json();
    const parsed = editRegistroGastoSchema.parse(body);
    console.log('registroId', registroId, parsed)
    const valorCents = Math.round(parsed.valorCents ?? 0);

    const result = await editRegistroGastoService(registroId, {
      ...parsed,
      valorCents,
    });
    console.log('result', result)
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, type: result.type },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message) }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
