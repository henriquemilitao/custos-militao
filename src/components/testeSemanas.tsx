"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ControleSemanal() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Date | null>(new Date());

  // Mock de semanas
  const semanas = ["Semana 1", "Semana 2", "Semana 3"];
  const [semanaSelecionada, setSemanaSelecionada] = useState(semanas[0]);

  // Mock de gastos por meta
  const gastosMeta = [
    { nome: "Gasolina", gasto: 50, total: 200 },
    { nome: "Futebol", gasto: 100, total: 150 },
    { nome: "Aleatórios", gasto: 120, total: 300 },
  ];

  // Mock de listagem por data
  const gastosPorData = {
    "12/09/2025": [
      { nome: "Supermercado", valor: 80 },
      { nome: "Uber", valor: 25 },
      { nome: "Futebol Quadra", valor: 37.5 },
    ],
    "13/09/2025": [
      { nome: "Gasolina", valor: 50 },
      { nome: "Lanche", valor: 22 },
    ],
  };

  // Helpers de data
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const anteontem = new Date(hoje);
  anteontem.setDate(hoje.getDate() - 2);

  return (
    <div className="p-4 max-w-sm mx-auto">
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-col">
        {/* Cabeçalho com select da semana */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Controle Semanal</h2>
            <p className="text-xs text-gray-500">01/09 - 07/09</p>
          </div>
          <select
            value={semanaSelecionada}
            onChange={(e) => setSemanaSelecionada(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {semanas.map((sem, idx) => (
              <option key={idx} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Resumo valores */}
        <div className="grid grid-cols-3 gap-2 text-center mb-6">
          <div>
            <p className="text-sm text-gray-500">Total Semana</p>
            <p className="text-sm font-medium">R$ 157,50</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gasto</p>
            <p className="text-sm font-medium text-red-500">R$ 0,00</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disponível</p>
            <p className="text-sm font-medium text-green-600">R$ 157,50</p>
          </div>
        </div>

        {/* Gastos por Meta */}
        <div className="space-y-3 mb-7">
          {/* <p className="text-sm font-medium text-gray-700">Gastos por Meta</p> */}
          {gastosMeta.map((item, idx) => {
            const porcentagem = (item.gasto / item.total) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{item.nome}</span>
                  <span>
                    R$ {item.gasto} / {item.total}
                  </span>
                </div>
                <Progress
                  value={porcentagem}
                  className="h-2 [&>div]:bg-blue-500"
                />
              </div>
            );
          })}
        </div>

        {/* Listagem de gastos por data */}
        <div className="space-y-4 flex-1">
          {Object.entries(gastosPorData).map(([data, gastos], idx) => (
            <div key={idx}>
              <p className="text-sm font-semibold text-gray-700 mb-1">📅 {data}</p>
              <ul className="space-y-1">
                {gastos.map((g, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-gray-600 border-b last:border-0 py-1"
                  >
                    <span>- {g.nome}</span>
                    <span>R$ {g.valor.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Botão de adicionar gasto no final */}
        <div className="mt-4">
          <Button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
          >
            <Plus size={16} className="mr-2" /> Adicionar gasto
          </Button>
        </div>
      </div>

      {/* Modal de adicionar gasto */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Adicionar gasto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Descrição */}
            <div className="space-y-1">
              <label className="text-base text-neutral-700">Descrição</label>
              <input
                placeholder="Com o que você gastou?"
                className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valor + Data */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-base text-neutral-700">Valor</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Data */}
              <div className="flex-1 space-y-1">
                <label className="text-base text-neutral-700">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data ? (
                        data.toDateString() === hoje.toDateString()
                          ? "Hoje"
                          : data.toDateString() === ontem.toDateString()
                          ? "Ontem"
                          : data.toDateString() === anteontem.toDateString()
                          ? "Anteontem"
                          : data.toDateString() === amanha.toDateString()
                          ? "Amanhã"
                          : format(data, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Escolha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data!}
                      onSelect={(d) => d && setData(d)}
                      locale={ptBR}
                      initialFocus
                      // showOutsideDays={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Categoria - agora usando gastos por meta */}
            <div className="space-y-1">
              <label className="text-base text-neutral-700">Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                {gastosMeta.map((opt, i) => (
                  <button
                    key={i}
                    className="border rounded-xl p-3 hover:border-blue-400 text-sm"
                  >
                    {opt.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              className="px-3 py-1 rounded-xl border"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
