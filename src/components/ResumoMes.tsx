"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(n) ? n : 0
  );
}

export default function ResumoMes({
  saldoInicial,
  totalPlanejado,
  totalGasto,
  saldoDisponivel,
  diferencaPlanejadoSaldo,
}: {
  saldoInicial: number;
  totalPlanejado: number;
  totalGasto: number;
  saldoDisponivel: number;
  diferencaPlanejadoSaldo: number;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Resumo do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-xs text-neutral-500">Saldo inicial</div>
            <div className="text-lg font-semibold">{moeda(saldoInicial)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Planejado</div>
            <div className="text-lg font-semibold">{moeda(totalPlanejado)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Gasto</div>
            <div className="text-lg font-semibold text-red-600">{moeda(totalGasto)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Saldo disponível</div>
            <div className={`text-lg font-semibold ${saldoDisponivel < 0 ? "text-red-600" : "text-green-600"}`}>
              {moeda(saldoDisponivel)}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Dif. (Saldo - Planejado)</div>
            <div className={`text-lg font-semibold ${diferencaPlanejadoSaldo < 0 ? "text-red-600" : "text-neutral-900"}`}>
              {moeda(diferencaPlanejadoSaldo)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
