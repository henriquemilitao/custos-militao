"use client";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/Economia/cardEconomias";
import TesteGastos from "@/components/2.0/Gastos/cardGastos";
import TesteSemanas from "@/components/2.0/Semanas/controleSemanal";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useCicloAtual } from "@/hooks/useCicloAtual";

export default function Page() {
  const userId = "978dbd3e-ff8c-4344-90af-0be8e53a9346"
  const { cicloAtual, isLoading, mutateCiclo } = useCicloAtual(userId)

  // if (isLoading) {
  //   return (
  //     <main className="flex items-center justify-center min-h-screen bg-neutral-50">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  //         <p className="text-sm text-gray-500 animate-pulse">Carregando...</p>
  //       </div>
  //     </main>
  //   )
  // }

  // if (isLoading) {
  //   return (
  //     <main className="flex flex-col items-center justify-center min-h-screen bg-white">
  //       <h1 className="text-base font-semibold text-blue-600 mb-4">Atualizando</h1>
  //       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  //       <p className="text-sm text-gray-500 mt-4">Carregando seus dados...</p>
  //     </main>
  //   )
  // }

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
      <HeaderSistema /> 
      <TesteResumo cicloAtual={cicloAtual}/>
      <TesteEconomia cicloAtual={cicloAtual} mutateCiclo={mutateCiclo}/>
      <TesteGastos cicloAtual={cicloAtual} mutateCiclo={mutateCiclo}/>
      <TesteSemanas cicloAtual={cicloAtual} mutateCiclo={mutateCiclo}/>
    </main>
  );
}
