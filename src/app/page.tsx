"use client";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/Economia/cardEconomia";
import TesteGastos from "@/components/2.0/testeGastos";
import TesteSemanas from "@/components/2.0/testeSemanas";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useEffect, useState } from "react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";

export default function Page() {
  const [cicloAtual, setCicloAtual] = useState<CicloAtualDTO | null>(null)
  
  useEffect(() => {
    fetch(`/api/ciclos/atual?userId=500f33f0-85ff-4f0c-a93a-c3118f43be4b`)
      .then(res => res.json())
      .then(data => {
        setCicloAtual(data)
      })
  }, [])

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* {JSON.stringify(cicloAtual)} */}
      <HeaderSistema /> 
      <TesteResumo cicloAtual={cicloAtual}/>
      <TesteEconomia cicloAtual={cicloAtual}/>
      <TesteGastos />
      <TesteSemanas />
    </main>
  );
}
