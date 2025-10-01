import { auth } from "@/lib/auth";
import { getProximoCiclo } from "@/services/ciclo/ciclo.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log('Oi')
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const dataFim = searchParams.get("dataFim") ?? undefined;

    if (!dataFim || typeof dataFim !== "string") {
        return NextResponse.json({ error: "Parâmetro dataFim obrigatório" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }
    try {
        const proximoCiclo = await getProximoCiclo(session.user.id, new Date(dataFim));

        if (!proximoCiclo) {
            return NextResponse.json({ message: "Nenhum ciclo encontrado" } , { status: 404 });
        }

        console.log(proximoCiclo)


        return NextResponse.json(proximoCiclo, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao buscar próximo ciclo" }, { status: 500});
}
}
