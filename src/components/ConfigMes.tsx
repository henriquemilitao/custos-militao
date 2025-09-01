"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategoriaFixaType, EstadoMes } from "@/app/page";
import { useState } from "react";
import { Trash2 } from "lucide-react";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(n) ? n : 0
  );
}

export default function ConfigMes({
  mes,
  estado,
  onUpdate,
}: {
  mes: string;
  estado: EstadoMes;
  onUpdate: (patch: Partial<EstadoMes>) => void;
}) {
  const [novoNome, setNovoNome] = useState("");
  const [novoValor, setNovoValor] = useState("0");

  const totalPlanejadoFixas = estado.categorias.reduce((s, c) => s + c.meta, 0);
  const totalPlanejado = totalPlanejadoFixas + estado.aleatorioMeta;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Configurações do Mês ({mes})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-600">Quanto recebo esse mes?</span>
            <input
              type="number"
              inputMode="decimal"
              className="border rounded-xl px-3 py-2 w-full"
              value={String(estado.saldoInicial)}
              onChange={(e) => onUpdate({ saldoInicial: Number(e.target.value) || 0 })}
            />
          </label>
        </div>

        {/* Adicionar nova categoria */}
        <div className="rounded-xl border p-3">
          <div className="text-sm font-medium mb-2">Adicionar gasto fixo</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border rounded-xl px-3 py-2 flex-1 w-full"
              placeholder="Nome (ex: Nutella :p)"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              className="border rounded-xl px-3 py-2 w-full sm:w-36"
              placeholder="Meta (R$)"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
            />
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                const meta = Number(novoValor) || 0;
                if (!novoNome.trim()) return;
                const nova: CategoriaFixaType = {
                  id: crypto.randomUUID(),
                  nome: novoNome.trim(),
                  meta,
                  pago: false,
                };
                onUpdate({ categorias: [...estado.categorias, nova] });
                setNovoNome("");
                setNovoValor("0");
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Listagem de categorias p/ editar/remover */}
        <div className="rounded-xl border p-3">
          <div className="text-sm font-medium mb-2">Gastos fixos do mês</div>
          <div className="space-y-2">
            {estado.categorias.length === 0 && (
              <div className="text-sm text-neutral-500">Nenhum gasto fixo.</div>
            )}
            {estado.categorias.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="text-sm font-medium break-words">
                  {c.nome} –{" "}
                  <span className="text-neutral-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(c.meta)}
                  </span>
                </span>
                <button
                  className="text-red-500 hover:text-red-700 transition"
                  onClick={() =>
                    onUpdate({
                      categorias: estado.categorias.filter((x) => x.id !== c.id),
                    })
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-neutral-600">
          Planejado: <b>{moeda(totalPlanejado)}</b> — Fixas: {moeda(totalPlanejadoFixas)}, Aleatório: {moeda(estado.aleatorioMeta)}
        </div>
      </CardContent>
    </Card>
  );
}