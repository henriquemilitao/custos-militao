// components/EconomiaItem.tsx
"use client";

import { CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Economia } from "./ConfigEconomia";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isFinite(n) ? n : 0);
}

export default function EconomiaItem({
  economia,
  onGuardar,
  onDesfazer,
  onRemove,
}: {
  economia: Economia;
  onGuardar: () => void;
  onDesfazer: () => void;
  onRemove: () => void;
}) {
  const concluida = economia.guardado >= economia.meta;

  return (
    <Card
      className={`p-4 border rounded-2xl shadow flex items-center justify-between transition duration-200 ${
        concluida ? "opacity-70 bg-gray-100" : "opacity-100 bg-white"
      }`}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {economia.titulo}
          {concluida && <CheckCircle className="w-5 h-5 text-green-600" />}
        </h3>
        <p className="text-sm text-gray-600">
          Meta: {moeda(economia.meta)} — Guardado: {moeda(economia.guardado)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={concluida ? onDesfazer : onGuardar}
          className={concluida ? "text-blue-500" : "text-green-600"}
        >
          {concluida ? (
            <RotateCcw className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
}
