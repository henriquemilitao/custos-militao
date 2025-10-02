// /api/ciclos/proximo/route.ts
import { auth } from "@/lib/auth";
import { getProximoCiclo } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url || "", "http://localhost");

  const dataFim = searchParams.get("dataFim");
  const referencia = searchParams.get("referencia");
  const cicloAtual = searchParams.get("cicloAtual") === "true"; // vem do front

  if (!referencia) {
    return NextResponse.json({ error: "Parâmetro referencia obrigatório" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }
  
  try {
    
    const proximoCiclo = await getProximoCiclo(
      session.user.id,
      new Date(referencia),
      cicloAtual
    );

    return NextResponse.json(proximoCiclo, { status: 200 });
  } catch (error) {

    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar próximo ciclo" }, { status: 500 });
  }
}
