// components/ClientPage.tsx
"use client";

import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/Economia/cardEconomias";
import TesteGastos from "@/components/2.0/Gastos/cardGastos";
import TesteSemanas from "@/components/2.0/Semanas/controleSemanal";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useCicloAtual } from "@/hooks/useCicloAtual";

export default function ClientPage({ userId }: { userId: string }) {
  const { cicloAtual, isLoading, mutateCiclo } = useCicloAtual(userId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 space-y-6">
        {/* aqui fica seu skeleton loader */}
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg shimmer"></div>
            <div className="h-6 w-28 rounded-md shimmer"></div>
            <div className="h-8 w-8 rounded-lg shimmer"></div>
          </div>
          <div className="h-8 w-8 rounded-full shimmer"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <HeaderSistema />
      <TesteResumo cicloAtual={cicloAtual} />
      <TesteEconomia cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
      <TesteGastos cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
      <TesteSemanas cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
    </main>
  );
}
