"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CategoriaFixaType } from "@/app/page";

export default function ConfigGastoFixo({
  onAdicionar,
}: {
  onAdicionar: (nova: Omit<CategoriaFixaType, "id" | "pago">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState<number | "">("");

  function reset() {
    setNome("");
    setValor("");
    setOpen(false);
  }

  return (
    <>
      {/* botão que abre o modal */}
      <Button
        onClick={() => setOpen(true)}
        className="px-3 py-1 w-10 h-10 rounded-full border border-blue-400 text-blue-500 bg-white shadow-none hover:bg-blue-500 hover:text-white"
      >
        <Plus className="w-5 h-5" />
      </Button>

      {/* modal simples */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 z-10">
            <h3 className="text-xl font-semibold mb-3">Novo Gasto Fixo</h3>

            <label className="text-base text-neutral-700 block mb-2">
              Nome
              <input
                className="mt-1 block w-full border rounded-xl px-3 py-2"
                placeholder="Ex.: Academia"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>

            <label className="text-base text-neutral-700 block mb-4">
              Valor (R$)
              <input
                type="number"
                inputMode="decimal"
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
              <button
                className="px-3 py-1 rounded-xl border"
                onClick={reset}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
                // size="icon"
                // className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
          
                onClick={() => {
                  const m = typeof valor === "number" ? valor : 0;
                  if (!nome.trim() || m <= 0) return;
                  onAdicionar({ nome: nome.trim(), meta: m });
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
