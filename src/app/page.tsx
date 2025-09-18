"use client";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/testeEconomia";
import TesteGastos from "@/components/2.0/testeGastos";
import TesteSemanas from "@/components/2.0/testeSemanas";
import HeaderSistema from "@/components/2.0/testeHeader";

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
