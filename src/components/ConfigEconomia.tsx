// components/ConfigEconomia.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type Economia = {
  id: string;
  titulo: string;
  meta: number;
  aportes: { id: string; data: string; valor: number }[];
};

export default function ConfigEconomia({
  onAdicionar,
  triggerLabel = "Adicionar Economia",
}: {
  onAdicionar: (nova: Omit<Economia, "id" | "aportes">) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [meta, setMeta] = useState<number | "">("");

  function reset() {
    setTitulo("");
    setMeta("");
    setOpen(false);
  }

  return (
    <>
      {/* botão que abre o "modal" */}
      <div>
        <Button onClick={() => setOpen(true)} 
        className="px-3 py-1 w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"        
        >
          {/* {triggerLabel} */}
          <Plus className="w-5 h-5" />
        </Button>
        
      </div>

      {/* modal simples */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-3">Nova Economia</h3>

            <label className="text-sm text-neutral-700 block mb-2">
              Nome
              <input
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                placeholder="Ex.: Reserva"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </label>

            <label className="text-sm text-neutral-700 block mb-4">
              Meta (R$)
              <input
                type="number"
                inputMode="decimal"
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
              <button
                className="px-3 py-1 rounded-xl border"
                onClick={() => reset()}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-black text-white"
                onClick={() => {
                  const m = typeof meta === "number" ? meta : 0;
                  if (!titulo.trim() || m <= 0) {
                    // validação simples
                    return;
                  }
                  onAdicionar({ titulo: titulo.trim(), meta: m });
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
