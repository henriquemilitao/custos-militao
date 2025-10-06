// /api/ciclos/proximo/route.ts
import { auth } from "@/lib/auth";
import { getCicloAnterior } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url || "", "http://localhost");

  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
    
  // console.log('ANTERIOR ROTAAAAAAAAAAAAAAAAAAAAAAAAA')
  // console.log({inicio, fim})

  if (!inicio || !fim) {
    return NextResponse.json({ error: "Parâmetro referencia obrigatório" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  try {
    const cicloAnterior = await getCicloAnterior({
      userId: session.user.id,
      dataInicio: inicio,
      dataFim: fim,
    });

    return NextResponse.json(cicloAnterior, { status: 200 });
  } catch (error) {

    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar ciclo anterior" }, { status: 500 });
  }
}
