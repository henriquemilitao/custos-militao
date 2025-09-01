"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { CategoriaFixaType } from "@/app/page";

export default function CategoriaFixa({
  categoria,
  onAddGasto,
  onRemove,
}: {
  categoria: CategoriaFixaType;
  onAddGasto: (id: string, valor: number) => void;
  onRemove: () => void;
}) {
  const [novoValor, setNovoValor] = useState("");

  const gastoTotal = categoria.gastos.reduce((acc, g) => acc + g.valor, 0);
  const restante = categoria.meta - gastoTotal;

  return (
    <Card className="p-4 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium">{categoria.nome}</p>
          <p className="text-xs text-neutral-500">
            Meta: R$ {categoria.meta.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500">
            Gasto: R$ {gastoTotal.toFixed(2)}
          </p>
          <p
            className={`text-xs font-medium ${
              restante < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            Restante: R$ {restante.toFixed(2)}
          </p>
        </div>

        <Button variant="destructive" onClick={onRemove}>
          Remover
        </Button>
      </div>

      {/* Formulário p/ adicionar gasto */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Novo gasto"
          value={novoValor}
          onChange={(e) => setNovoValor(e.target.value)}
          className="border rounded-xl px-2 py-1 flex-1"
        />
        <Button
          onClick={() => {
            if (!novoValor) return;
            onAddGasto(categoria.id, Number(novoValor));
            setNovoValor("");
          }}
        >
          Adicionar
        </Button>
      </div>

      {/* Lista de gastos lançados */}
      {categoria.gastos.length > 0 && (
        <div className="mt-2 text-xs text-neutral-600 space-y-1">
          {categoria.gastos.map((g) => (
            <div
              key={g.id}
              className="flex justify-between bg-neutral-50 rounded px-2 py-1"
            >
              <span>{g.data}</span>
              <span>R$ {g.valor.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
