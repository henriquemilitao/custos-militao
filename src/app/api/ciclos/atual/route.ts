import { notFound, ok } from "@/lib/http";
import { getCicloAtual } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // const { userId } = await req.json()

    const { searchParams } = new URL(req.url || "", "http://localhost");

    const inicio = searchParams.get("dataInicio");
    const fim = searchParams.get("dataFim");


    const userId = searchParams.get("userId") ?? undefined;

    const cicloAtual = await getCicloAtual(
        userId, 
        inicio ?? '', 
        fim ?? ''
    )

    if (!cicloAtual) {
        return notFound()
    }

    return NextResponse.json(cicloAtual, { status: 200 });
}