"use client";
import TesteResumo from "@/components/testeResumo";
import TesteEconomia from "@/components/testeEconomia";
import TesteGastos from "@/components/testeGastos";
import TesteSemanas from "@/components/testeSemanas";
import HeaderSistema from "@/components/testeHeader";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <HeaderSistema /> 
      <TesteResumo />
      <TesteEconomia />
      <TesteGastos />
      <TesteSemanas />
    </main>
  );
}
