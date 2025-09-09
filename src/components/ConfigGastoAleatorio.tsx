import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import type { GastoItem } from "@/app/page";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function dataHojeCampoGrande(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Campo_Grande" }));
}

export default function ConfigGastoAleatorio({
  semanaIndex,
  bloqueada,
  onAddGasto,
}: {
  semanaIndex: number;
  bloqueada: boolean;
  onAddGasto: (semanaIndex: number, item: GastoItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState<Date>(dataHojeCampoGrande());

  const hoje = dataHojeCampoGrande();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const anteontem = new Date(hoje);
  anteontem.setDate(hoje.getDate() - 2);

  const handleSalvar = () => {
    const v = Number(valor) || 0;
    if (!desc.trim() || v <= 0 || !data) return;

    onAddGasto(semanaIndex, {
      id: crypto.randomUUID(),
      descricao: desc.trim(),
      valor: v,
      dataPtBr: data.toLocaleDateString("pt-BR", { timeZone: "America/Campo_Grande" }),
    });

    setDesc("");
    setValor("");
    setData(dataHojeCampoGrande());
    setOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition mt-2"
        disabled={bloqueada}
        onClick={() => setOpen(true)}
      >
        <Plus className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Adicionar gasto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Descrição */}
            <div className="space-y-1">
            <label className="text-base text-neutral-700">Descrição</label>
            <input
              placeholder="Com o que você gastou?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="block w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
            {/* Valor + Data */}
            <div className="flex gap-3">
              {/* Valor */}
              <div className="flex-1 space-y-1">
                <label className="text-base text-neutral-700">Valor</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
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
                      selected={data}
                      onSelect={(d) => d && setData(d)}
                      month={dataHojeCampoGrande()}
                      fromDate={new Date(data.getFullYear(), data.getMonth(), 1)}
                      toDate={new Date(data.getFullYear(), data.getMonth() + 1, 0)}
                      locale={ptBR}
                      initialFocus
                      showOutsideDays={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
            <Button variant="outline" className="px-3 py-1 rounded-xl border" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
