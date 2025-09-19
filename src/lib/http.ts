import { NextResponse } from "next/server"

export function ok(data: any) {
    console.log('sss')
  return NextResponse.json(data, { status: 200 })
}

export function notFound(message = "Recurso não encontrado") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function badRequest(message = "Requisição inválida") {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function serverError(message = "Erro interno") {
  return NextResponse.json({ error: message }, { status: 500 })
}
