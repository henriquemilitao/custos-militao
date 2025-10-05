// /api/ciclos/proximo/route.ts
import { auth } from "@/lib/auth";
import { getProximoCiclo } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url || "", "http://localhost");

  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  // console.log({
  //   inicio,
  //   fim
  // })

  if (!inicio || !fim) {
    return NextResponse.json({ error: "Parâmetro referencia obrigatório" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }
  console.log('DATAS Q CHEGARAM NA ROTAAAAAAAAAAAA')
  console.log('---------------------------------------')

  console.log({inicio, fim})
  console.log('---------------------------------------')
  try {
    const proximoCiclo = await getProximoCiclo({
      userId: session.user.id,
      dataInicio: inicio,
      dataFim: fim,
    });

    // console.log({proximoCiclo})
    // return
    return NextResponse.json(proximoCiclo, { status: 200 });
  } catch (error) {

    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar próximo ciclo" }, { status: 500 });
  }
}
