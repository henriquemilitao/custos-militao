import { notFound, ok } from "@/lib/http";
import { getCicloAtual } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const dataFim = searchParams.get("dataFim");

    console.log(dataFim)
    if (!dataFim) {
        return notFound()
    }

    return NextResponse.json(dataFim, { status: 200 });
}