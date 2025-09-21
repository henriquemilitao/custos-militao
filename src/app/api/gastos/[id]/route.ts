import { notFound, ok } from "@/lib/http"
import { deleteGastoService } from "@/services/gasto/gasto.service"
import { NextRequest } from "next/server"


export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string}>}) {
  const gastoId = (await context.params).id

  const gasto = await deleteGastoService(gastoId)

  if (!gasto) {
    return notFound()
  }

  return ok(gasto)
}