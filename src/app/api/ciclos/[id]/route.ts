import { badRequest, notFound, ok, serverError } from "@/lib/http"
import { getCicloById } from "@/services/ciclo/ciclo.service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, context: { params: Promise<{ id: string}>} ) {
    const cicloId = (await context.params).id

    try {
        const ciclo = await getCicloById(cicloId)
        if (!ciclo) {
            return notFound()
        }
        return NextResponse.json({
            ...ciclo, 
            valorTotal: Number(ciclo.valorTotal)
        },    
        {status: 200})

    } catch (error) {
        return serverError()
    }
}