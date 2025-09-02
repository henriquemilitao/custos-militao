"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditableCurrency from "./EditableCurrency";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(n) ? n : 0
  );
}

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

  // total economias planejadas
  const totalEconomias = economias.reduce((acc, e) => acc + e.meta, 0);

  // total já economizado
  const totalEconomizado = economias.reduce((acc, e) => acc + e.guardado, 0);

  // quanto falta economizar
  const restanteEconomias = totalEconomias - totalEconomizado;

  // saldo após economias planejadas
  const totalRealParaGastar = saldoInicial - totalEconomias;

  // ainda a gastar / disponível
  const restanteFixas = totalPlanejadoFixas - gastoFixas;
  const restanteAleatorio = aleatorioMeta - gastoAleatorio;

  return (
    <Card className="rounded-2xl shadow-sm m-4">
      <CardHeader>
        <CardTitle>Resumo do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Total recebido */}
          <div>
            <div className="text-neutral-500">Total recebido</div>
            <EditableCurrency
              value={saldoInicial}
              onChange={(novo) => onUpdateSaldoInicial(novo)}
            />
          </div>

          {/* Economias */}
          <div>
            <div className="text-neutral-500">Economias</div>
            <div className="text-lg font-semibold text-blue-600">
              Meta: {moeda(totalEconomias)}
            </div>
            <div className="text-xs text-green-600">
              Já economizei: {moeda(totalEconomizado)}
            </div>
            <div
              className={`text-xs ${restanteEconomias < 0 ? "text-red-600" : "text-blue-600"}`}
            >
              Ainda preciso economizar: {moeda(restanteEconomias)}
            </div>
          </div>

          {/* Total real para gastar */}
          <div>
            <div className="text-neutral-500">Total real para gastar no mês</div>
            <div className="text-lg font-semibold text-green-600">{moeda(totalRealParaGastar)}</div>
          </div>

          {/* Gastos fixos */}
          <div>
            <div className="text-neutral-500">Total gasto com gastos fixos</div>
            <div className="text-lg font-semibold text-red-600">{moeda(gastoFixas)}</div>
            <div className="text-xs text-neutral-500">
              Planejado: {moeda(totalPlanejadoFixas)}
            </div>
            <div
              className={`text-xs ${restanteFixas < 0 ? "text-red-600" : "text-neutral-500"}`}
            >
              Ainda tenho que gastar: {moeda(restanteFixas)}
            </div>
          </div>

          {/* Aleatório */}
          <div>
            <div className="text-neutral-500">Total gasto com aleatório</div>
            <div className="text-lg font-semibold text-red-600">{moeda(gastoAleatorio)}</div>
            <div className="text-xs text-neutral-500">
              Planejado: {moeda(aleatorioMeta)}
            </div>
            <div
              className={`text-xs ${restanteAleatorio < 0 ? "text-red-600" : "text-green-600"}`}
            >
              Ainda posso gastar: {moeda(restanteAleatorio)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
