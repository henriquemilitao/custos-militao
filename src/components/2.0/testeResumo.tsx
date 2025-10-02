"use client";

import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { formatDateDayMonth, formatIsoToDayMonth, formatPeriodoDayMonth} from "@/lib/formatters/formatDate";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import EditableCurrency from "../EditableCurrency";
import { toast } from "sonner";

// No início do arquivo testeResumo.tsx, adicione esta interface:
interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
  name?: string;
  value?: number;
}

type ResumoMesCardProps = {
  mutateCiclo: () => void
  cicloAtual: CicloAtualDTO | null
}

export default function ResumoMesCard({cicloAtual, mutateCiclo}: ResumoMesCardProps) {
  // const economiasMesTotal = cicloAtual?.economias.reduce((acc, economia) => economia.valor + acc, 0) ?? 0
  // const gastosMesTotal = cicloAtual?.gastos?.reduce((acc, gasto) => gasto.valor + acc, 0) ?? 0
  // const valorMesTotal = cicloAtual?.valorTotal ?? 0
  // const disponivelMes = valorMesTotal - economiasMesTotal - gastosMesTotal
  async function changeTotalCiclo(novoTotal: number) {
    if (!cicloAtual?.id) {
      // se não tem ciclo ainda → cria
      return createCiclo(novoTotal);
    }

    // se já tem ciclo → atualiza
    return updateCiclo(cicloAtual.id, novoTotal);
  }

  async function createCiclo(novoTotal: number) {
    try {
      const res = await fetch(`/api/ciclos`, {
        method: "POST",
        body: JSON.stringify({ valorCents: novoTotal }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || "Erro ao criar ciclo");
        return;
      }

      toast.success("Ciclo criado com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
    } catch {
      toast.error("Não foi possível criar o ciclo");
    }
  }

  async function updateCiclo(cicloId: string, novoTotal: number) {
    try {
      const res = await fetch(`/api/ciclos/${cicloId}`, {
        method: "PATCH",
        body: JSON.stringify({ valorCents: novoTotal }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || "Erro ao atualizar ciclo");
        return;
      }

      toast.success("Ciclo atualizado com sucesso!", {
        style: { background: "#dcfce7", color: "#166534" },
      });

      mutateCiclo();
    } catch {
      toast.error("Não foi possível atualizar o ciclo");
    }
  }


  const data = [
    { name: "Gastos", value: cicloAtual?.gastoTotalJaRealizado, color: "#ef4444" },
    { name: "Economias", value: cicloAtual?.economiasJaGuardadas, color: "#3b82f6" },
    { name: "Disponível", value: cicloAtual?.disponivelMes, color: "#22c55e" },
  ];

  console.log({cicloAtual, data})

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* Título  TALVEZ TER Q VERIFICAR AQUI DEPOIS, SE FOR HORA 0, ELE PEGA O DIA ANTERIOR*/}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Resumo do Mês 
            
          </h2>
        {cicloAtual?.id &&  
          <p className="text-sm text-gray-500 mb-2">{
            cicloAtual && `
              ${formatDateDayMonth(cicloAtual?.dataInicio)} - ${formatDateDayMonth(cicloAtual?.dataFim)}
              `
            }</p>
        }
        </div>

        {/* Gráfico */}
        {cicloAtual?.id &&  
          <div className="h-57 flex items-center justify-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  // label={(entry) =>
                  //   `${((entry as any).percent * 100).toFixed(0)}%`
                  // }
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        }

        {/* Infos principais */}
        <div className="grid grid-cols-2 gap-3 text-sm mt-5">
          <div className="rounded-xl p-3 text-center bg-gray-50">
            <p className="text-gray-500">Recebido</p>
            {/* <p className="font-semibold text-gray-800">{formatCurrencyFromCents(cicloAtual?.valorTotal ?? 0)}</p> */}
            <EditableCurrency value={cicloAtual?.valorTotal ?? 0} onChange={changeTotalCiclo} />
          </div>
          <div className="rounded-xl p-3 text-center bg-red-50">
            <p className="text-gray-500">Gastos</p>
            <p className="font-semibold text-red-600">{formatCurrencyFromCents(cicloAtual?.gastoTotalJaRealizado ?? 0)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-blue-50">
            <p className="text-gray-500">Economia</p>
            <p className="font-semibold text-blue-600">{formatCurrencyFromCents(cicloAtual?.economiasJaGuardadas ?? 0)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-green-50">
            <p className="text-gray-500">Disponível</p>
            <p className="font-semibold text-green-600">{formatCurrencyFromCents(cicloAtual?.disponivelMes ?? 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
