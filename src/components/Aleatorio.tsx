// components/Aleatorio.tsx
"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EstadoMes, GastoItem } from "@/app/page";

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
 * - fechadas: flags de "finalizado" (não usadas para fixar, mas para lógica de redistribuição)
 * - fixas: quotas travadas (number | null); se fixas[i] != null => quota daquela semana está fixa
 *
 * Algoritmo:
 *  - começa com base = meta * peso / somaPesos
 *  - aplica fixas (substitui quota[i] = fixas[i] onde houver)
 *  - percorre j=0..3: calcula delta = quota[j] - gasto[j]; se delta != 0 e a semana j "pode redistribuir"
 *    (teve gasto > 0 ou foi marcada como finalizada), então distribui delta entre semanas futuras
 *    que não estão fixas, proporcional aos seus pesos.
 */
function calcularQuotasDinamicas(
  metaMes: number,
  totaisPorSemana: number[],
  fechadas: [boolean, boolean, boolean, boolean],
  fixas: [number | null, number | null, number | null, number | null]
): { base: number[]; quotas: number[] } {
  const somaPesos = PESOS.reduce((a, b) => a + b, 0);

  // Quotas base com pesos [1,1,1,1.5]
  const base = PESOS.map((p) => (metaMes / somaPesos) * p);

  // Se nada foi gasto e nenhuma semana está marcada como fechada/fixa -> quotas = base
  const anySpentOrClosedOrFixed =
    totaisPorSemana.some((v) => (v || 0) > 0) ||
    fechadas.some(Boolean) ||
    fixas.some((v) => v != null);
  if (!anySpentOrClosedOrFixed) {
    return { base, quotas: [...base] };
  }

  // encontra o último índice que possui gasto / está fechado / tem quota fixa
  let lastIdx = -1;
  for (let i = 0; i < 4; i++) {
    if ((totaisPorSemana[i] || 0) > 0 || fechadas[i] || fixas[i] != null) lastIdx = i;
  }
  if (lastIdx === -1) return { base, quotas: [...base] };

  // quotas começam como base
  const quotas = [...base];

  // para semanas já até lastIdx: aplicar quota fixa (se houver) ou base
  for (let i = 0; i <= lastIdx; i++) {
    quotas[i] = fixas[i] != null ? fixas[i]! : base[i];
  }

  // resto real disponível = meta - soma(gastos até lastIdx)
  const gastoAteLast = totaisPorSemana.slice(0, lastIdx + 1).reduce((s, v) => s + (v || 0), 0);
  let restante = metaMes - gastoAteLast;

  // semanas futuras (indices > lastIdx)
  const futureIdxs: number[] = [];
  for (let i = lastIdx + 1; i < 4; i++) futureIdxs.push(i);

  if (futureIdxs.length === 0) return { base, quotas };

  // soma de quotas fixas já definidas nas futuras
  let fixedFutureSum = 0;
  for (const i of futureIdxs) {
    if (fixas[i] != null) fixedFutureSum += fixas[i]!;
  }

  // pesos dos futuros que NÃO são fixos
  const nonFixedWeights = futureIdxs.reduce((acc, i) => (fixas[i] == null ? acc + PESOS[i] : acc), 0);

  // quanto sobra depois de reservar as quotas fixas futuras
  const restanteDepoisFix = restante - fixedFutureSum;

  // se não há quotas não-fixas (tudo futuro já fixo), só aplicamos as fixas
  if (nonFixedWeights <= 0) {
    for (const i of futureIdxs) {
      quotas[i] = fixas[i] != null ? fixas[i]! : 0;
    }
    return { base, quotas };
  }

  // distribuir restanteDepoisFix proporcionalmente pelos pesos das semanas futuras não-fixas
  for (const i of futureIdxs) {
    if (fixas[i] != null) {
      quotas[i] = fixas[i]!;
    } else {
      quotas[i] = (restanteDepoisFix * PESOS[i]) / nonFixedWeights;
    }
  }

  return { base, quotas };
}






export default function Aleatorio({
  meta,
  semanas,
  fechadas,
  fixas,
  onChangeMeta,
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
  // agora o segundo argumento é a quota atual (number) quando fechando, ou null/undefined quando reabrindo
  onToggleFechar: (semanaIndex: number, fixedQuota?: number | null) => void;
}) {
  const totaisPorSemana = semanas.map((items) => items.reduce((s, it) => s + it.valor, 0));

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
                    Quota dinâmica: {moeda(quotaDin)} {fixas[i] != null ? "(fixa)" : i === 0 ? "(fixa pela base)" : ""}
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
