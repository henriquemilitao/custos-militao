"use client";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/Economia/cardEconomia";
import TesteGastos from "@/components/2.0/testeGastos";
import TesteSemanas from "@/components/2.0/testeSemanas";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useCicloAtual } from "@/hooks/useCicloAtual";

export default function Page() {
  const userId = "a3df3468-b574-40a4-8631-51f115517186"
  const { cicloAtual, isLoading, mutateCiclo } = useCicloAtual(userId)

  if (isLoading) return <p>Carregando...</p>

  return (
    <main className="min-h-screen bg-neutral-50">
      <HeaderSistema /> 
      <TesteResumo cicloAtual={cicloAtual}/>
      <TesteEconomia cicloAtual={cicloAtual} mutateCiclo={mutateCiclo}/>
      {/* <TesteGastos cicloAtual={cicloAtual} mutateCiclo={mutateCiclo}/> */}
      <TesteSemanas />
    </main>
  );
}
