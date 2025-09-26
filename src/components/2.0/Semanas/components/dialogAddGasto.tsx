"use client";

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
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  data: Date | null;
  setData: (d: Date | null) => void;
};

export function DialogAddGasto({ open, setOpen, data, setData }: Props) {
  const hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
  const anteontem = new Date(hoje); anteontem.setDate(hoje.getDate() - 2);

  const gastosMeta = [
    { nome: "Gasolina", gasto: 50, total: 200 },
    { nome: "Futebol", gasto: 100, total: 150 },
    { nome: "Aleatórios", gasto: 120, total: 300 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Adicionar gasto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-base text-neutral-700">Descrição</label>
            <input
              placeholder="Com o que você gastou?"
              className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-base text-neutral-700">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {gastosMeta.map((opt, i) => (
                <button key={i} className="border rounded-xl p-3 hover:border-blue-400 text-sm">
                  {opt.nome}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
          <Button variant="outline" className="px-3 py-1 rounded-xl border" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
