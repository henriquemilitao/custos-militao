// components/Aleatorio.tsx
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
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Campo_Grande" });
}

/**
 * Calcula quotas base e quotas dinâmicas.
 * - metaMes: número total para o mês
 * - totaisPorSemana: [n0,n1,n2,n3] soma de gastos por semana
 * - fechadas: [b0,b1,b2,b3] (se true, semana está "fechada" e não recebe redistribuições futuras)
 *
 * Retorna: { base: number[], quotas: number[] }
 */
function calcularQuotasDinamicas(
  metaMes: number,
  totaisPorSemana: number[],
  fechadas: [boolean, boolean, boolean, boolean]
): { base: number[]; quotas: number[] } {
  const somaPesos = PESOS.reduce((a, b) => a + b, 0);
  const base = PESOS.map((p) => (metaMes / somaPesos) * p);

  // quotas começam iguais à base
  const quotas = [...base];

  // para cada semana j que pode redistribuir (teve gasto ou foi marcada como fechada)
  // calculamos delta = base[j] - gasto_j (pode ser positivo ou negativo)
  // e propagamos esse delta proporcionalmente para semanas futuras não fechadas (i > j)
  for (let j = 0; j < 4; j++) {
    const gastoJ = Number(totaisPorSemana[j] ?? 0);
    const teveGasto = gastoJ > 0;
    const podeRedistribuir = teveGasto || fechadas[j] === true;
    if (!podeRedistribuir) continue;

    const delta = (base[j] ?? 0) - gastoJ; // positivo => sobra; negativo => excesso
    if (delta === 0) continue;

    // peso disponível nas semanas futuras (somente i > j que não estejam fechadas)
    let pesoFuturo = 0;
    for (let k = j + 1; k < 4; k++) {
      if (!fechadas[k]) pesoFuturo += PESOS[k];
    }

    if (pesoFuturo <= 0) {
      // nada pra receber → nada a fazer
      continue;
    }

    for (let i = j + 1; i < 4; i++) {
      if (fechadas[i]) continue;
      quotas[i] += delta * (PESOS[i] / pesoFuturo);
    }
  }

  return { base, quotas };
}

export default function Aleatorio({
  meta,
  semanas,
  fechadas,
  onChangeMeta,
  onAddGasto,
  onRemoveGasto,
  onToggleFechar,
}: {
  meta: number;
  semanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  fechadas: [boolean, boolean, boolean, boolean];
  onChangeMeta: (v: number) => void;
  onAddGasto: (semanaIndex: number, item: GastoItem) => void;
  onRemoveGasto: (semanaIndex: number, itemId: string) => void;
  onToggleFechar: (semanaIndex: number) => void;
}) {
  // totais numéricos por semana (usado pelo cálculo)
  const totaisPorSemana = semanas.map((items) => items.reduce((s, it) => s + it.valor, 0));

  const { base: quotaBasePorSemana, quotas: quotasDinamicas } = useMemo(
    () => calcularQuotasDinamicas(meta, totaisPorSemana, fechadas),
    [meta, totaisPorSemana, fechadas]
  );

  // UI de adicionar gasto (inline por semana)
  function AddForm({ index }: { index: number }) {
    const [desc, setDesc] = useState("");
    const [valor, setValor] = useState("");
    const semanaFechada = fechadas[index];

    return (
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          className="border rounded-xl px-3 py-1.5 flex-1 w-full"
          placeholder="Descrição (ex.: Sorvete)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={semanaFechada}
        />
        <input
          type="number"
          inputMode="decimal"
          className="border rounded-xl px-3 py-1.5 w-32"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={semanaFechada}
        />
        <Button
          className="w-full sm:w-auto"
          disabled={semanaFechada}
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
          <div className="text-xs text-neutral-500">
            Cotas base: [{quotaBasePorSemana.map((q) => moeda(q)).join(", ")}]
          </div>
        </div>

        {Array.from({ length: 4 }, (_, i) => i).map((i) => {
          const totalSemana = totaisPorSemana[i] || 0;
          const quotaDin = quotasDinamicas[i] || 0;
          const restante = quotaDin - totalSemana; // pode ser negativo (estouro)

          return (
            <div key={i} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">Semana {i + 1}</div>
                  <div className="text-xs text-neutral-500">
                    Quota dinâmica: {moeda(quotaDin)} {i === 0 ? "(fixa pela base)" : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      fechadas[i] ? "bg-green-50 border-green-200 text-green-700" : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {fechadas[i] ? "Semana fechada" : "Semana aberta"}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => onToggleFechar(i)}>
                    {fechadas[i] ? "Reabrir" : "Finalizar semana"}
                  </Button>
                </div>
              </div>

              {/* Lista de gastos */}
              <div className="mt-2 space-y-1">
                {semanas[i].length === 0 && (
                  <div className="text-xs text-neutral-400">Nenhum gasto lançado.</div>
                )}
                {semanas[i].map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between text-sm bg-neutral-50 rounded-lg px-2 py-1"
                  >
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

              <div className="mt-2 text-xs text-neutral-600 flex items-center justify-between">
                <span>Total na semana: <b>{moeda(totalSemana)}</b></span>
                <span className={`${restante < 0 ? "text-red-600" : "text-green-600"}`}>
                  Restante: {moeda(restante)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
