// components/EconomiaItem.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Economia } from "./ConfigEconomia";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(n) ? n : 0
  );
}

export default function EconomiaItem({
  economia,
  onGuardar,
  onRemove,
}: {
  economia: Economia;
  onGuardar: () => void;
  onRemove: () => void;
}) {
  const concluida = economia.guardado >= economia.meta;

  return (
    <Card
      className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-opacity duration-200 ${
        concluida ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Ícone de status */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            concluida ? "bg-green-100" : "bg-neutral-100"
          }`}
        >
          {concluida ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>

        {/* Título + metas */}
        <div className="min-w-0">
          <p className="font-medium truncate">{economia.titulo}</p>
          <p className="text-xs text-neutral-500">
            Meta: {moeda(economia.meta)} — Guardado: {moeda(economia.guardado)}
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="flex items-center gap-2">
        {!concluida && (
          <Button onClick={onGuardar} className="px-3 py-1">
            Guardar
          </Button>
        )}
        {/* <Button variant={economia.guardado >= economia.meta ? "secondary" : "default"} onClick={onGuardar} className="px-3 py-1">
          {economia.guardado >= economia.meta ? "Desfazer" : "Pagar"}
        </Button> */}
        <Button variant="destructive" onClick={onRemove} className="px-3 py-1">
          Remover
        </Button>
      </div>
    </Card>
  );
}
