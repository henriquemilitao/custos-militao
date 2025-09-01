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
 * - totaisPorSemana: [n0,n1,n2,n3] soma de gastos por semana (number[])
 * - fechadas: flags de "finalizado" (boolean[])
 * - fixas: quotas travadas (number | null)[]
 *
 * Regras principais:
 * - Se não houve gasto e não há semanas fechadas/fixas => quotasDinamicas = quotasBase
 * - Se existe ao menos uma semana fechada/fixa => pivot = último índice fechado/fixo
 *   -> quotas até pivot = base (ou quota fixa se fixada)
 *   -> quotas futuras = distribuir (meta - gastoAtePivot) pelas semanas futuras proporcional ao peso
 * - Se NÃO há semanas fechadas/fixas e existe gasto -> pivot = último índice com gasto (comportamento dinâmico)
 */
function calcularQuotasDinamicas(
  metaMes: number,
  totaisPorSemana: number[],
  fechadas: [boolean, boolean, boolean, boolean],
  fixas: [number | null, number | null, number | null, number | null]
): { base: number[]; quotas: number[] } {
  const somaPesos = PESOS.reduce((a, b) => a + b, 0);
  const base = PESOS.map((p) => (metaMes / somaPesos) * p);

  const anySpent = totaisPorSemana.some((v) => (v || 0) > 0);
  const anyClosedOrFixed = fechadas.some(Boolean) || fixas.some((v) => v != null);

  // sem nada acontecendo -> quotas = base
  if (!anySpent && !anyClosedOrFixed) {
    return { base, quotas: [...base] };
  }

  // determina pivot:
  // - se houver semanas fechadas/fixas: pivot = último índice fechado/fixo
  // - senão (nenhuma fechada/fixa), pivot = último índice com gasto
  let lastIdx = -1;
  if (anyClosedOrFixed) {
    for (let i = 0; i < 4; i++) {
      if (fechadas[i] || fixas[i] != null) lastIdx = i;
    }
  } else {
    for (let i = 0; i < 4; i++) {
      if ((totaisPorSemana[i] ?? 0) > 0) lastIdx = i;
    }
  }

  // se pivot não definido, retorna base
  if (lastIdx === -1) return { base, quotas: [...base] };

  // quotas começam iguais à base
  const quotas = [...base];

  // aplica quotas até pivot: base ou quota fixa se houver
  for (let i = 0; i <= lastIdx; i++) {
    quotas[i] = fixas[i] != null ? fixas[i]! : base[i];
  }

  // gasto até pivot (somente gastos, NÃO subtrair quotas fixas)
  const gastoAtePivot = totaisPorSemana.slice(0, lastIdx + 1).reduce((s, v) => s + (v || 0), 0);
  const restante = metaMes - gastoAtePivot;

  // indices futuros (> pivot)
  const futureIdxs: number[] = [];
  for (let i = lastIdx + 1; i < 4; i++) futureIdxs.push(i);
  if (futureIdxs.length === 0) return { base, quotas };

  // soma das quotas fixas já definidas nas futuras (reservas)
  let fixedFutureSum = 0;
  for (const i of futureIdxs) {
    if (fixas[i] != null) fixedFutureSum += fixas[i]!;
  }

  // pesos das futuras não-fixas
  const nonFixedWeights = futureIdxs.reduce((acc, i) => (fixas[i] == null ? acc + PESOS[i] : acc), 0);

  // quanto sobra para distribuir entre as não-fixadas
  const restanteDepoisFix = restante - fixedFutureSum;

  if (nonFixedWeights <= 0) {
    // todas as futuras já fixadas -> aplica fixas (ou 0)
    for (const i of futureIdxs) quotas[i] = fixas[i] != null ? fixas[i]! : 0;
    return { base, quotas };
  }

  // se restanteDepoisFix <= 0, então não há mais orçamento para distribuir -> quotas não-fixas = 0
  for (const i of futureIdxs) {
    if (fixas[i] != null) {
      quotas[i] = fixas[i]!;
    } else {
      quotas[i] = restanteDepoisFix > 0 ? (restanteDepoisFix * PESOS[i]) / nonFixedWeights : 0;
    }
  }

  return { base, quotas };
}

export default function Aleatorio({
  meta,
  semanas,
  fechadas,
  fixas,
  onAddGasto,
  onRemoveGasto,
  onToggleFechar,
}: {
  meta: number;
  semanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  fechadas: [boolean, boolean, boolean, boolean];
  fixas: [number | null, number | null, number | null, number | null];
  onChangeMeta: (v: number) => void;
  onAddGasto: (semanaIndex: number, item: GastoItem) => void;
  onRemoveGasto: (semanaIndex: number, itemId: string) => void;
  onToggleFechar: (semanaIndex: number, fixedQuota?: number | null) => void;
}) {
  // totais por semana (números)
  const totaisPorSemana = semanas.map((items) => items.reduce((s, it) => s + it.valor, 0));

  // calcula quotas e base (useMemo para performance)
  const { base: quotaBasePorSemana, quotas: quotasDinamicas } = useMemo(
    () => calcularQuotasDinamicas(meta, totaisPorSemana, fechadas, fixas),
    [meta, totaisPorSemana, fechadas, fixas]
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
          <div className="text-sm text-neutral-600">
            Total disponível para Aleatório: <b>{moeda(meta)}</b>
          </div>
          <div className="text-xs text-neutral-500">
            Cotas base: [{quotaBasePorSemana.map((q: number) => moeda(q)).join(", ")}]
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
                    Quota dinâmica: {moeda(quotaDin)} {fixas[i] != null ? "(fixa)" : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      fechadas[i] ? "bg-green-50 border-green-200 text-green-700" : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {fechadas[i] ? "Semana finalizada" : "Semana aberta"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // se estamos fechando (fechadas[i] === false) passamos a quota atual para fixar
                      // se estamos reabrindo (fechadas[i] === true) passamos null para limpar a fixação
                      onToggleFechar(i, fechadas[i] ? null : quotasDinamicas[i]);
                    }}
                  >
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
