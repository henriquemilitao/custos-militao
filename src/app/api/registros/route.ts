import { NextRequest, NextResponse } from "next/server";
import { ZodError} from "zod";
import { createRegistroGastoSchema } from "@/dtos/registroGasto.schema";
import { createRegistroGastoService } from "@/services/registroGasto/registroGasto.service";
import { created } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRegistroGastoSchema.parse(body);

    const valorCents = Math.round(parsed.valorCents ?? 0);

    const result = await createRegistroGastoService({
      ...parsed,
      valorCents,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, type: result.type },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message) },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


