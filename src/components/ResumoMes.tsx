// ResumoMes.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditableCurrency from "./EditableCurrency";
import { moedaBRL } from "@/lib/formatters/currency";
import ProgressBar from "@/components/ui/progress-bar";

// function clamp(n: number) {
//   if (!isFinite(n)) return 0;
//   return Math.max(0, n);
// }

export default function ResumoMes({
  saldoInicial,
  economias,
  gastoFixas,
  gastoAleatorio,
  totalPlanejadoFixas,
  aleatorioMeta,
  onUpdateSaldoInicial,
}: {
  saldoInicial: number;
  economias: { meta: number; guardado: number }[];
  gastoFixas: number;
  gastoAleatorio: number;
  totalPlanejadoFixas: number;
  aleatorioMeta: number;
  onUpdateSaldoInicial: (novo: number) => void;
}) {
  // Totais
  const totalEconomias = economias.reduce((acc, e) => acc + e.meta, 0);
  const totalEconomizado = economias.reduce((acc, e) => acc + e.guardado, 0);
  const restanteEconomias = totalEconomias - totalEconomizado;
  const totalSemEconomias = saldoInicial - totalEconomias;

  // quanto sobra para gastar depois que eu já reservei as economias planejadas
  const totalRealParaGastar = saldoInicial - totalEconomias;

  // restantes para cada categoria
  const restanteFixas = totalPlanejadoFixas - gastoFixas;
  const restanteAleatorio = aleatorioMeta - gastoAleatorio;

  // saldo líquido estimado após os gastos já feitos
  const saldoEstimadoPosGastos = totalRealParaGastar - gastoFixas - gastoAleatorio;

  // porcentagens para as barrinhas
  const pctEconomias = totalEconomias > 0 ? (totalEconomizado / totalEconomias) * 100 : 0;
  const pctFixas = totalPlanejadoFixas > 0 ? (gastoFixas / totalPlanejadoFixas) * 100 : gastoFixas > 0 ? 100 : 0;
  const pctAleatorio = aleatorioMeta > 0 ? (gastoAleatorio / aleatorioMeta) * 100 : gastoAleatorio > 0 ? 100 : 0;

  return (
    <Card className="rounded-2xl shadow-sm m-4 mb-10">
      <CardHeader>
        <CardTitle>Resumo do Mês/Ciclo</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Top: saldo + destaque do disponível */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white rounded-2xl border">
            <div className="text-base text-neutral-500">Total recebido no Mês</div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <EditableCurrency value={saldoInicial} onChange={(v) => onUpdateSaldoInicial(v)} />
                <div className="text-sm text-neutral-500">Valor mensal (edite se necessário)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border flex flex-col justify-between">
            <div>
              <div className="text-base text-neutral-500">Disponível após economias</div>
              <div className={`mt-2 text-2xl font-semibold ${totalSemEconomias < 0 ? "text-red-600" : "text-green-600"}`}>
                {moedaBRL(totalRealParaGastar)}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Saldo estimado após economias planejadas
              </div>
            </div>

            <div className="mt-4">
              <div className={`text-base ${saldoEstimadoPosGastos < 0 ? "text-red-600" : "text-neutral-500"}`}>
                Saldo final estimado
              </div>
              <div className={`text-xl font-semibold ${saldoEstimadoPosGastos < 0 ? "text-red-600" : "text-gray-800"}`}>
                {moedaBRL(saldoEstimadoPosGastos)}
              </div>
              <div className="text-sm text-neutral-400 mt-1">Após gastos fixos e aleatórios já registrados</div>
            </div>
          </div>
        </div>

        {/* Grid de métricas com barras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Economias */}
          <div className="p-4 bg-white rounded-2xl border">
            <div className="flex items-baseline justify-between mb-5">
              <div className="mt-2 flex items-baseline flex-col">
                <p className="text-base text-neutral-500">Economias</p>
                <p className="text-2xl font-semibold text-blue-600">{moedaBRL(totalEconomias)}</p>
              </div>
              <p className="text-base text-neutral-500">Guardado: <br />{moedaBRL(totalEconomizado)}</p>
            </div>


            <ProgressBar
              percent={pctEconomias}
              label={restanteEconomias <= 0 ? `Meta atingida` : `Faltam ${moedaBRL(restanteEconomias)}`}
              forceGreen={true}
            />
          </div>

          {/* Gastos Fixos */}
          <div className="p-4 bg-white rounded-2xl border">
            <div className="flex items-baseline justify-between mb-5">
              <div className="mt-2 flex items-baseline flex-col">
                <p className="text-base text-neutral-500">Gastos fixos</p>
                <p className="text-2xl font-semibold text-red-600">{moedaBRL(gastoFixas)}</p>
              </div>
              <p className="text-base text-neutral-500">Planejado: <br />{moedaBRL(totalPlanejadoFixas)}</p>
            </div>

              <ProgressBar
                percent={pctFixas}
                // warn={pctFixas > 65 && pctFixas <= 100}
                label={restanteFixas < 0 ? `Ultrapassou ${moedaBRL(Math.abs(restanteFixas))}` : `Disponível: ${moedaBRL(restanteFixas)}`}
              />
          </div>

          {/* Aleatório */}
          <div className="p-4 bg-white rounded-2xl border">
            <div className="flex items-baseline justify-between mb-5">
              <div className="mt-2 flex items-baseline flex-col">
                <p className="text-base text-neutral-500">Aleatório</p>
                <p className="text-2xl font-semibold text-red-600">{moedaBRL(gastoAleatorio)}</p>
              </div>
              <p className="text-base text-neutral-500">Planejado: <br />{moedaBRL(aleatorioMeta)}</p>
            </div>

            <ProgressBar
              percent={pctAleatorio}
              // warn={pctAleatorio > 90 && pctAleatorio <= 100}
              label={restanteAleatorio < 0 ? `Ultrapassou ${moedaBRL(Math.abs(restanteAleatorio))}` : `Disponível: ${moedaBRL(restanteAleatorio)}`}
            />
          </div>
        </div>

        {/* <div className="mt-4 text-sm text-neutral-500">
          Dica: se uma barra ficar vermelha, significa que você já gastou mais que o planejado — reveja suas categorias ou ajuste o saldo/meta.
        </div> */}
      </CardContent>
    </Card>
  );
}
