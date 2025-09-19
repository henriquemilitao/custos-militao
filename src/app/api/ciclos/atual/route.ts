import { notFound, ok } from "@/lib/http";
import { getCicloAtual } from "@/services/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { userId } = await req.json()

    const cicloAtual = await getCicloAtual(userId)

    if (!cicloAtual) {
        return notFound()
    }

    return ok(cicloAtual)
}