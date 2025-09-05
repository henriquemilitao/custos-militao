"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3 } from "lucide-react";
import type { CategoriaFixaType } from "@/app/page";

type Props = {
  onAdicionar?: (nova: Omit<CategoriaFixaType, "id" | "pago">) => void;
  onSalvarEdit?: (id: string, dados: { nome: string; meta: number }) => void;
  initial?: { id: string; nome: string; meta: number } | null;
  trigger?: React.ReactNode;
};

export default function ConfigGastoFixo({
  onAdicionar,
  onSalvarEdit,
  initial = null,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<number | "">("");

  // Modo edição apenas quando vier "initial" E tivermos "onSalvarEdit"
  const isEditMode = Boolean(initial && onSalvarEdit);

  function openModal() {
    // preenche os campos quando abrir
    if (isEditMode && initial) {
      setNome(initial.nome);
      setValor(initial.meta);
    } else {
      setNome("");
      setValor("");
    }
    setOpen(true);
  }

  function reset() {
    setNome("");
    setValor("");
    setOpen(false);
  }

  return (
    <>
      {trigger ? (
        <span onClick={openModal}>{trigger}</span>
      ) : (
        <Button
          onClick={openModal}
          className="px-3 py-1 w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
          title={isEditMode ? "Editar gasto fixo" : "Novo gasto fixo"}
        >
          {isEditMode ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={reset} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 z-10">
            <h3 className="text-xl font-semibold mb-3">
              {isEditMode ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
            </h3>

            <label className="text-base text-neutral-700 block mb-2">
              Nome
              <input
                className="mt-1 block w-full border rounded-xl px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Ex.: Academia"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isEditMode && initial?.nome.toLowerCase() === "gasolina"}
              />
            </label>

            <label className="text-base text-neutral-700 block mb-4">
              Valor (R$)
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                placeholder="100"
                value={valor === "" ? "" : String(valor)}
                onChange={(e) => {
                  const v = e.target.value;
                  setValor(v === "" ? "" : Number(v));
                }}
              />
            </label>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded-xl border" onClick={reset}>
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
                onClick={() => {
                  const m = typeof valor === "number" ? valor : 0;
                  if (!nome.trim() || m <= 0) return;

                  if (isEditMode && onSalvarEdit && initial) {
                    onSalvarEdit(initial.id, { nome: nome.trim(), meta: m });
                  } else if (!isEditMode && onAdicionar) {
                    onAdicionar({ nome: nome.trim(), meta: m });
                  }
                  reset();
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
