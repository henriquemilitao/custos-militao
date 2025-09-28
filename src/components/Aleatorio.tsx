// components/Aleatorio.tsx
"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GastoItem } from "@/types/budget";
import { Plus, Trash2 } from "lucide-react";
import ConfigGastoAleatorio from "./ConfigGastoAleatorio";
import { moedaBRL } from "@/lib/formatters/currency";

const PESOS = [1, 1, 1, 1.5] as const;

function dataHojeCampoGrande(): string {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Campo_Grande" });
}

/**
 * Regra de ouro:
 * 1) Concluída = tem gasto em alguma semana futura OU foi marcada como "fechada".
 * 2) Para semanas concluídas, a distribuição é sequencial: a meta da semana i é
 *    calculada sobre o orçamento restante naquele ponto; depois subtrai-se o que
 *    FOI GASTO (não a meta) para redistribuir sobras/estouros para as próximas.
 * 3) Para a semana atual + futuras, distribuímos o orçamento restante (após
 *    as concluídas) pelos pesos remanescentes, sem “consumir” nada da semana atual.
 */
function calcularMetasPorSemana(
  metaMes: number,
  totais: number[],
  fechadas: [boolean, boolean, boolean, boolean]
) {
  const pesos = [...PESOS] as number[];

  // atividade em cada semana (tem gasto ou foi fechada)
  const atividade = [0, 1, 2, 3].map((i) => (totais[i] ?? 0) > 0 || !!fechadas[i]);

  // concluída se existe atividade em alguma semana FUTURA OU se ela própria foi fechada
  const concluida = [0, 1, 2, 3].map((i) => {
    if (fechadas[i]) return true;
    for (let j = i + 1; j < 4; j++) {
      if (atividade[j]) return true;
    }
    return false;
  });

  // índice da primeira semana NÃO concluída (semana atual).
  // se todas concluídas, usamos 4 para indicar "nenhuma atual".
  const firstOpen = concluida.findIndex((c) => !c);
  const currentIdx = firstOpen === -1 ? 4 : firstOpen;

  const metas = [0, 0, 0, 0] as number[];

  // Se não há nenhuma semana com gasto/fechada => ninguém concluído => base pura.
  const somaPesosTotal = pesos.reduce((a, b) => a + b, 0);
  if (currentIdx === 0) {
    for (let i = 0; i < 4; i++) {
      metas[i] = (metaMes * pesos[i]) / somaPesosTotal;
    }
    return { metas, concluida, currentIdx };
  }

  // 1) Processa semanas concluídas sequencialmente (0 .. currentIdx-1)
  let restante = metaMes;
  for (let i = 0; i < Math.min(currentIdx, 4); i++) {
    const somaPesosRestantes = pesos.slice(i).reduce((a, b) => a + b, 0);
    metas[i] = (restante * pesos[i]) / somaPesosRestantes;

    // subtrai o que de fato foi gasto para repassar sobras/estouros
    const gasto = totais[i] ?? 0;
    restante = restante - gasto;
  }

  // 2) Distribui o restante entre semana atual e futuras (currentIdx .. 3)
  if (currentIdx <= 3) {
    const somaPesosFuturos = pesos.slice(currentIdx).reduce((a, b) => a + b, 0);
    for (let i = currentIdx; i < 4; i++) {
      metas[i] = somaPesosFuturos > 0 ? (restante * pesos[i]) / somaPesosFuturos : 0;
    }
  }

  return { metas, concluida, currentIdx };
}

export default function Aleatorio({
  meta,
  semanas,
  fechadas,
  onAddGasto,
  onRemoveGasto,
  onToggleFechar,
}: {
  meta: number;
  semanas: [GastoItem[], GastoItem[], GastoItem[], GastoItem[]];
  fechadas: [boolean, boolean, boolean, boolean];
  fixas: [number | null, number | null, number | null, number | null];
  onAddGasto: (semanaIndex: number, item: GastoItem) => void;
  onRemoveGasto: (semanaIndex: number, itemId: string) => void;
  onToggleFechar: (semanaIndex: number, fixedQuota?: number | null) => void;
}) {
  const totaisPorSemana = semanas.map((items) => items.reduce((s, it) => s + it.valor, 0));

  const { metas, currentIdx } = useMemo(
    () => calcularMetasPorSemana(meta, totaisPorSemana, fechadas),
    [meta, totaisPorSemana, fechadas]
  );

  // function AddForm({ index }: { index: number }) {
  //   const [desc, setDesc] = useState("");
  //   const [valor, setValor] = useState("");

  //   // bloquear adição em semana concluída (passada) ou fechada
  //   const bloqueada = fechadas[index] || index < currentIdx;

  //   return (
  //     <div className="flex flex-col sm:flex-row gap-2 mt-2">
  //       <input
  //         className="border rounded-xl px-3 py-1.5 flex-1 w-full"
  //         placeholder="Com o que vc gastou?"
  //         value={desc}
  //         onChange={(e) => setDesc(e.target.value)}
  //         disabled={bloqueada}
  //       />
  //       <input
  //         type="number"
  //         inputMode="decimal"
  //         className="border rounded-xl px-3 py-1.5 w-32"
  //         placeholder="R$ 0,00"
  //         value={valor}
  //         onChange={(e) => setValor(e.target.value)}
  //         disabled={bloqueada}
  //       />
  //       <Button
  //         size="icon"
  //         // className="w-10 h-10 rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"
  //         className="w-10 h-10 w-full sm:w-auto rounded-full bg-blue-500 text-white shadow hover:bg-blue-600 active:scale-95 transition"

  //         disabled={bloqueada}
  //         onClick={() => {
  //           const v = Number(valor) || 0;
  //           if (!desc.trim() || v <= 0) return;
  //           onAddGasto(index, {
  //             id: crypto.randomUUID(),
  //             descricao: desc.trim(),
  //             valor: v,
  //             dataPtBr: dataHojeCampoGrande(),
  //           });
  //           setDesc("");
  //           setValor("");
  //         }}
  //       >
  //         <Plus className="w-5 h-5" />
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Gastos Variados (Aleatório)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-base text-neutral-600">
          Total disponível para usar: <b>{moedaBRL(meta)}</b>
        </div>

        {Array.from({ length: 4 }, (_, i) => i).map((i) => {
          const totalSemana = totaisPorSemana[i] || 0;
          const metaSemana = metas[i] || 0;
          const delta = metaSemana - totalSemana; // pode ser negativo

          const status =
            i < currentIdx
              ? "finalizada"
              : i === currentIdx
              ? "atual"
              : "futura";

          return (
            <div key={i} className="rounded-xl border p-3">
              <div className="grid grid-cols-2 gap-2 items-start">
                {/* Coluna esquerda */}
                <div>
                  <div className="font-medium">Semana {i + 1}</div>
                  <div className="text-sm text-neutral-500">
                    Posso gastar no máx: <span className="text-base font-medium text-gray-800">{moedaBRL(metaSemana)}</span>
                  </div>
                </div>

                {/* Coluna direita */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-sm px-2 py-1 rounded-full border ${
                      status === "finalizada"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : status === "atual"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {status === "finalizada"
                      ? "Semana finalizada"
                      : status === "atual"
                      ? "Semana atual"
                      : "Semana futura"}
                  </span>

                  {/* Botão de finalizar/reabrir:
                      - Finalizar só faz sentido na semana atual
                      - Reabrir só funciona se ela foi marcada como fechada manualmente
                  */}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={i < currentIdx && !fechadas[i]}
                    onClick={() => onToggleFechar(i, null)}
                  >
                    {fechadas[i]
                      ? "Reabrir"
                      : i === currentIdx
                      // ? "Finalizar semana"
                      ? "Finalizar"
                      : "Finalizar"}
                  </Button>
                </div>
              </div>

              {/* Lista de gastos */}
              <div className="mt-2 space-y-1">
                {semanas[i].length === 0 && (
                  <div className="text-sm text-neutral-400">Nenhum gasto lançado.</div>
                )}
                {semanas[i].map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between text-base bg-neutral-50 rounded-lg px-2 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-500">{g.dataPtBr}</span>
                      <span className="font-medium break-words break-all">{g.descricao}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span>{moedaBRL(g.valor)}</span>
                      <button
                        onClick={() => onRemoveGasto(i, g.id)}
                        className="text-red-600 text-sm hover:underline"
                        disabled={i < currentIdx && !fechadas[i]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adicionar gasto */}
              <ConfigGastoAleatorio
                semanaIndex={i}
                bloqueada={fechadas[i] || i < currentIdx}
                onAddGasto={onAddGasto}
              />

              {/* Rodapé da semana */}
              <div className="mt-2 text-sm text-neutral-600 flex items-center justify-between">
                <span>
                  Total gasto: <b className="text-base font-medium text-gray-800">{moedaBRL(totalSemana)}</b>
                </span>

                { i < currentIdx ? (
                  delta >= 0 ? (
                    <span className="text-green-600 text-sm">
                      Sobrou: <span className="text-base font-medium">{moedaBRL(delta)}</span> (repassado às próximas)
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm">
                      Excedeu: <span className="text-base font-medium">{moedaBRL(-delta)}</span> (descontado das próximas)
                    </span>
                  )
                ) : i === currentIdx ? (
                  delta < 0 ? (
                    <span className="text-red-600">
                      Ultrapassou:{" "}
                      <span className="text-base font-medium">{moedaBRL(-delta)}</span>
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Posso gastar ainda:{" "}
                      <span className="text-base font-medium">{moedaBRL(delta)}</span>
                    </span>
                  )
                ) : (
                  <span className="text-neutral-600">
                    Posso gastar ainda: {moedaBRL(metaSemana - totalSemana)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
