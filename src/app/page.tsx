"use client";
import TesteResumo from "@/components/2.0/testeResumo";
import TesteEconomia from "@/components/2.0/testeEconomia";
import TesteGastos from "@/components/2.0/testeGastos";
import TesteSemanas from "@/components/2.0/testeSemanas";
import HeaderSistema from "@/components/2.0/testeHeader";
import { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";

export type CicloComRelacionamentos = Prisma.CicloGetPayload<{
  include: { economias: true; gastos: true; semanas: { include: { registros: true } } }
}>

export default function Page() {
  const idTeste = '82505fb0-96d5-487b-a394-a9550e016bb9'
  const [ciclo, setCiclo] = useState<CicloComRelacionamentos | null>(null)
  
  useEffect(() => {
    fetch(`/api/ciclos/${idTeste}`)
      .then(res => res.json())
      .then(data => {
        setCiclo(data)
      })
      .catch(err =>
        console.error(err)
      )
  }, [])
  return (
    <main className="min-h-screen bg-neutral-50">
      <HeaderSistema /> 
      <TesteResumo ciclo={ciclo}/>
      <TesteEconomia />
      <TesteGastos />
      <TesteSemanas />
    </main>
  );
}
