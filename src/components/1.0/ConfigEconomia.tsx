"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3 } from "lucide-react";
import { toast } from "sonner"; // 🔔 precisa instalar: npm i sonner
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";


export type Economia = {
  id: string;
  titulo: string;
  meta: number;
  economizado: boolean;
};

type Props = {
  onAdicionar?: (nova: Omit<Economia, "id" | "economizado">) => void;
  onSalvarEdit?: (id: string, dados: { titulo: string; meta: number }) => void;
  initial?: { id: string; titulo: string; meta: number } | null;
  trigger?: React.ReactNode;
  isReserva?: boolean;
  onOpenChange?: (open: boolean) => void;
  readOnly?: boolean; // 👈 NOVO
};

export default function ConfigEconomia({
  onAdicionar,
  onSalvarEdit,
  initial = null,
  trigger,
  isReserva = false,
  onOpenChange,
  readOnly
}: Props) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [meta, setMeta] = useState<number | "">("");

  const isEditMode = Boolean(initial && onSalvarEdit);

  function openModal() {
    if (isEditMode && initial) {
      setTitulo(initial.titulo);
      setMeta(initial.meta);
    } else {
      setTitulo("");
      setMeta("");
    }
    setOpen(true);
    onOpenChange?.(true); // 🔹 avisa que abriu
  }

  function reset() {
    setTitulo("");
    setMeta("");
    setOpen(false);
    onOpenChange?.(false); // 🔹 avisa que fechou
  }

  function handleSalvar() {
    console.log(">>> Salvando economia...");
    const m = typeof meta === "number" ? meta : 0;
    if (!titulo.trim()) return;

    if (isReserva) {
      if (m < 0) {
        toast("A meta da Reserva de Emergência não pode ser negativa.", {
          description: "Defina um valor maior que zero.",
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
        return;
      }
      if (m === 0) {
        console.log(">>> Chamando toast de meta zero");
        toast("Você precisa guardar pelo menos alguma coisa na Reserva.", {
          description: "Digite um valor maior que zero.",
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
        return;
      }
    }

    const valorFinal = m;

    if (isEditMode && onSalvarEdit && initial) {
      onSalvarEdit(initial.id, { titulo: titulo.trim(), meta: valorFinal });
    } else if (!isEditMode && onAdicionar) {
      onAdicionar({ titulo: titulo.trim(), meta: valorFinal });
    }
    reset();
  }

  return (
    <>
      {trigger ? (
        <span onClick={openModal}>{trigger}</span>
      ) : (
        <Button
          onClick={openModal}
          className="px-3 py-1 w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
          title={isEditMode ? "Editar economia" : "Nova economia"}
        >
          {isEditMode ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      )}

      <Dialog open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange?.(nextOpen); // 🔹 garante que o pai saiba se tá aberto ou não
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">{isEditMode ? "Editar Economia" : "Nova Economia"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
             <label className="text-base text-neutral-700 block mb-2">
              Nome
              <input
                placeholder="Ex: Viagem, Carro..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={`mt-1 block w-full border rounded-xl px-3 py-2 ${readOnly && 'bg-gray-100 cursor-not-allowed'}`}
                disabled={readOnly}
              />
            </label>
            <label className="text-base text-neutral-700 block mb-4">
              Valor (R$)
              <input
                type="number"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={meta === "" ? "" : String(meta)}
                onChange={(e) => setMeta(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                />
              </label>
          </div>

          <DialogFooter className="mt-2 flex flex-row justify-end gap-2">
            <Button variant="outline" className="px-3 py-1 rounded-xl border" onClick={() => {
              setOpen(false);
              onOpenChange?.(false);
            }}>Cancelar</Button>
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
