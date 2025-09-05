"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit3 } from "lucide-react";

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
};

export default function ConfigEconomia({
  onAdicionar,
  onSalvarEdit,
  initial = null,
  trigger,
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
  }

  function reset() {
    setTitulo("");
    setMeta("");
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
          title={isEditMode ? "Editar economia" : "Nova economia"}
        >
          {isEditMode ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={reset} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 z-10">
            <h3 className="text-xl font-semibold mb-3">
              {isEditMode ? "Editar Economia" : "Nova Economia"}
            </h3>

            <label className="text-base text-neutral-700 block mb-2">
              Nome
              <input
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                placeholder="Ex.: Reserva"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </label>

            <label className="text-base text-neutral-700 block mb-4">
              Meta (R$)
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                placeholder="100"
                value={meta === "" ? "" : String(meta)}
                onChange={(e) => {
                  const v = e.target.value;
                  setMeta(v === "" ? "" : Number(v));
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
                  const m = typeof meta === "number" ? meta : 0;
                  if (!titulo.trim() || m <= 0) return;

                  if (isEditMode && onSalvarEdit && initial) {
                    onSalvarEdit(initial.id, { titulo: titulo.trim(), meta: m });
                  } else if (!isEditMode && onAdicionar) {
                    onAdicionar({ titulo: titulo.trim(), meta: m });
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
