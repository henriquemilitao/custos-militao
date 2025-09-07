"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { GastoItem } from "@/app/page";

function dataHojeCampoGrande(): string {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Campo_Grande" });
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

  const handleSalvar = () => {
    const v = Number(valor) || 0;
    if (!desc.trim() || v <= 0) return;

    onAddGasto(semanaIndex, {
      id: crypto.randomUUID(),
      descricao: desc.trim(),
      valor: v,
      dataPtBr: dataHojeCampoGrande(),
    });

    setDesc("");
    setValor("");
    setOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        // className="w-10 h-10 rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition mt-2"
        className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition mt-2"
        disabled={bloqueada}
        onClick={() => setOpen(true)}
      >
        <Plus className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar gasto</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <input
              placeholder="Com o que você gastou?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-1 block w-full border rounded-xl px-3 py-2"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1 block w-full border rounded-xl px-3 py-2"
            />
          </div>

          <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
            <Button variant="outline" className="px-3 py-1 rounded-xl border" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvar}
                // className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
                className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition">
                    Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
