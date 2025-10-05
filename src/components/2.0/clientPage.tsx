"use client";

import { useEffect, useState } from "react";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/Economia/cardEconomias";
import TesteGastos from "@/components/2.0/Gastos/cardGastos";
import TesteSemanas from "@/components/2.0/Semanas/controleSemanal";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useCicloAtual } from "@/hooks/useCicloAtual";

export default function ClientPage({ userId }: { userId: string }) {
  // estado que controla o ciclo atual
  const [datas, setDatas] = useState<{ inicio: string; fim: string } | null>(null);

  // hook que busca o ciclo atual
  const { cicloAtual, isLoading, dataInicio, dataFim, mutateCiclo } = useCicloAtual(
    userId,
    datas?.inicio,
    datas?.fim
  );

  // quando a página abrir, se não tiver datas salvas, usa as de hoje
  useEffect(() => {
    if (!datas && dataInicio && dataFim) {
      setDatas({ inicio: dataInicio, fim: dataFim });
    }
  }, [dataInicio, dataFim]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 space-y-6">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm rounded-2xl">
          {/* Navegação esquerda */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg shimmer"></div>
            <div className="h-6 w-28 rounded-md shimmer"></div>
            <div className="h-8 w-8 rounded-lg shimmer"></div>
          </div>

          {/* Avatar */}
          <div className="h-8 w-8 rounded-full shimmer"></div>
        </div>

        {/* Skeleton Resumo do Mês */}
        <div className="p-4 max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
            {/* Título + datas */}
            <div>
              <div className="h-6 w-40 rounded-md shimmer mb-2"></div>
              <div className="h-4 w-32 rounded-md shimmer"></div>
            </div>

            {/* Gráfico redondo fake com animação */}
            <div className="flex items-center justify-center mb-13 mt-10">
              <div className="h-40 w-40 rounded-full shimmer animate-spin-slow"></div>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 gap-4 text-sm mt-5">
              <div className="rounded-xl h-16 shimmer"></div>
              <div className="rounded-xl h-16 shimmer"></div>
              <div className="rounded-xl h-16 shimmer"></div>
              <div className="rounded-xl h-16 shimmer"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <HeaderSistema
        cicloAtual={cicloAtual}
        mutateCiclo={mutateCiclo}
        dataInicio={dataInicio}
        dataFim={dataFim}
        userId={userId}
        setDatas={setDatas}
      />
      <TesteResumo cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} dataInicio={dataInicio} dataFim={dataFim}/>
      <TesteEconomia cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
      <TesteGastos cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
      <TesteSemanas cicloAtual={cicloAtual} mutateCiclo={mutateCiclo} />
    </main>
  );
}
