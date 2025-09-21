// app/api/ciclos/[id]/gastos/route.ts
import { NextResponse } from "next/server";
import { getGastosByCicloId } from "@/services/gasto/gasto.service";

export async function GET(_: Request, context: { params: { id: string } } ) {
  try {
    const cicloId = context?.params?.id;
    if (!cicloId) {
      return NextResponse.json({ error: "cicloId is required" }, { status: 400 });
    }

    const gastos = await getGastosByCicloId(cicloId);

    // transformar Date em ISO strings (se necessário)
    const safe = gastos.map(g => ({
      ...g,
      dataPago: g.dataPago ? g.dataPago.toISOString() : null,
      createdAt: g.createdAt ? g.createdAt.toISOString() : null,
      updatedAt: g.updatedAt ? g.updatedAt.toISOString() : null,
    }));

    return NextResponse.json(safe, { status: 200 });
  } catch (err) {
    console.error("API /ciclos/:id/gastos error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
