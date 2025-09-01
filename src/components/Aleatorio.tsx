"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GastoItem } from "@/app/page";

const PESOS = [1, 1, 1, 1.5] as const;

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(n) ? n : 0
  );
}

function dataHojeCampoGrande(): string {
  // Apenas string PT-BR da data no fuso America/Campo_Grande
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Campo_Grande" });
}

export default function Aleatorio({
  meta,
  semanas,
  onChangeMeta,
  onAddGasto,
  onRemoveGasto,
}: {
  meta: number;
  semanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  onChangeMeta: (v: number) => void;
  onAddGasto: (semanaIndex: number, item: GastoItem) => void;
  onRemoveGasto: (semanaIndex: number, itemId: string) => void;
}) {
  const somaPesos = PESOS.reduce((a, b) => a + b, 0);
  const cotaBase = meta / somaPesos;
  const quotaBasePorSemana = PESOS.map((p) => p * cotaBase);

  const totaisPorSemana = semanas.map((items) => items.reduce((s, it) => s + it.valor, 0));

  // Semana "atual lógica": primeira que ainda não tem lançamentos
  const semanaAtualIndex = useMemo(() => {
    for (let i = 0; i < 4; i++) if ((semanas[i]?.length || 0) === 0) return i;
    return 3;
  }, [semanas]);

  // Cálculo dinâmico: redistribui o restante do mês a partir da semana atual
  // FIX: para semanas já fechadas (w < semanaAtualIndex) consideramos a própria soma realizada dessa semana como quota dinâmica
  const quotasDinamicas = useMemo(() => {
    const realizadoAteCutoff = totaisPorSemana.slice(0, semanaAtualIndex).reduce((a, b) => a + b, 0);
    const restante = Math.max(0, meta - realizadoAteCutoff);
    const pesosRestantes = PESOS.slice(semanaAtualIndex).reduce((a, b) => a + b, 0);

    return Array.from({ length: 4 }, (_, w) => {
      if (w < semanaAtualIndex) {
        // Antes: retornávamos quota base (causando restante exibido errado).
        // Agora: para refletir que a semana já fechou, a quota dinâmica é o próprio total gasto nessa semana — assim restante = 0.
        return totaisPorSemana[w] || 0;
      }
      return pesosRestantes > 0 ? (restante * PESOS[w]) / pesosRestantes : 0;
    });
  }, [meta, semanaAtualIndex, totaisPorSemana]);

  // UI de adicionar gasto (inline por semana)
  function AddForm({ index }: { index: number }) {
    const [desc, setDesc] = useState("");
    const [valor, setValor] = useState("");
    return (
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          className="border rounded-xl px-3 py-1.5 flex-1 w-full"
          placeholder="Descrição (ex.: Sorvete)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          type="number"
          inputMode="decimal"
          className="border rounded-xl px-3 py-1.5 w-32"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            const v = Number(valor) || 0;
            if (!desc.trim() || v <= 0) return;
            onAddGasto(index, {
              id: crypto.randomUUID(),
              descricao: desc.trim(),
              valor: v,
              dataPtBr: dataHojeCampoGrande(),
            });
            setDesc("");
            setValor("");
          }}
        >
          Adicionar gasto
        </Button>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Categoria Aleatório</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <label className="text-sm text-neutral-600">Meta do mês</label>
          <input
            type="number"
            inputMode="decimal"
            className="border rounded-xl px-3 py-2 w-full sm:w-40"
            value={String(meta)}
            onChange={(e) => onChangeMeta(Number(e.target.value) || 0)}
          />
          <div className="text-xs text-neutral-500">Cotas base: [{quotaBasePorSemana.map((q) => moeda(q)).join(", ")}]</div>
        </div>

        {Array.from({ length: 4 }, (_, i) => i).map((i) => {
          const totalSemana = totaisPorSemana[i] || 0;
          const quotaDin = quotasDinamicas[i] || 0;
          const restante = Math.max(0, quotaDin - totalSemana);
          return (
            <div key={i} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Semana {i + 1}</div>
                  <div className="text-xs text-neutral-500">Quota dinâmica: {moeda(quotaDin)}</div>
                </div>
                <div className={`text-sm ${restante < 0 ? "text-red-600" : "text-green-600"}`}>
                  Restante: {moeda(restante)}
                </div>
              </div>

              {/* Lista de gastos */}
              <div className="mt-2 space-y-1">
                {semanas[i].length === 0 && (
                  <div className="text-xs text-neutral-400">Nenhum gasto lançado.</div>
                )}
                {semanas[i].map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-sm bg-neutral-50 rounded-lg px-2 py-1">
                    <div className="truncate">
                      <span className="text-neutral-500 mr-2">{g.dataPtBr}</span>
                      <span className="font-medium">{g.descricao}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{moeda(g.valor)}</span>
                      <button
                        onClick={() => onRemoveGasto(i, g.id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar gasto */}
              <AddForm index={i} />

              <div className="mt-2 text-xs text-neutral-600">
                Total na semana: <b>{moeda(totalSemana)}</b>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}