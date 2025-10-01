import { NextResponse } from "next/server";
import { createCicloByValorTotalService } from "@/services/ciclo/ciclo.service";

export async function POST(req: Request) {
  const body = await req.json();
  const ciclo = await createCicloByValorTotalService({
    valorCents: body.valorCents,
    req,
  });

  return NextResponse.json(ciclo);
}