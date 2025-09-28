"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helpers para data
const hoje = new Date();
const ontem = new Date(hoje);
ontem.setDate(hoje.getDate() - 1);
const anteontem = new Date(hoje);
anteontem.setDate(hoje.getDate() - 2);
const amanha = new Date(hoje);
amanha.setDate(hoje.getDate() + 1);

function formatarData(data: Date) {
  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "Ontem";
  if (data.toDateString() === anteontem.toDateString()) return "Anteontem";
  if (data.toDateString() === amanha.toDateString()) return "Amanhã";
  return format(data, "dd/MM/yyyy", { locale: ptBR });
}

export default function testeCardSemanas() {
  const [data, setData] = useState<Date>(hoje);

  // Mock dos gastos fracionados da semana
  const fracionados = [
    { nome: "Gasolina", valor: 50, total: 50 },
    { nome: "Futebol", valor: 37.5, total: 37.5 },
    { nome: "Aleatórios", valor: 237.5, total: 237.5 },
  ];

  // Mock de gastos agrupados por data
  const gastos = [
    { data: hoje, descricao: "Supermercado", valor: 80 },
    { data: hoje, descricao: "Uber", valor: 25 },
    { data: ontem, descricao: "Gasolina", valor: 50 },
    { data: ontem, descricao: "Lanche", valor: 22 },
    { data: anteontem, descricao: "Futebol Quadra", valor: 37.5 },
  ];

  // Agrupando por data
  const gastosPorData = gastos.reduce((acc: Record, gasto) => {
    const chave = formatarData(gasto.data);
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(gasto);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-8">
      {/* Card da Semana */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Semana 1</CardTitle>
          <p className="text-muted-foreground">💰 Total disponível: R$ 325,00</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fracionados.map((f) => (
            <div key={f.nome} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{f.nome}</span>
                <span>R$ {f.valor.toFixed(2)}</span>
              </div>
              <Progress value={(f.valor / f.total) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Campo de Data */}
      <div className="space-y-2">
        <label className="text-base text-neutral-700">Data</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data ? formatarData(data) : <span>Escolha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={data}
              onSelect={(d) => d && setData(d)}
              month={hoje}
              fromDate={new Date(hoje.getFullYear(), hoje.getMonth(), 1)}
              toDate={new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)}
              locale={ptBR}
              initialFocus
              showOutsideDays={false}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Listagem de Gastos */}
      <div className="space-y-6">
        {Object.entries(gastosPorData).map(([dataFormatada, lista]) => (
          <div key={dataFormatada} className="space-y-2">
            <h3 className="font-semibold text-lg">{dataFormatada}</h3>
            <div className="space-y-1 pl-4">
              {lista.map((g, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b pb-1 last:border-none"
                >
                  <span>{g.descricao}</span>
                  <span>R$ {g.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
