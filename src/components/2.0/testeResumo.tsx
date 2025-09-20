"use client";

import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { formatDateToDayMonth } from "@/lib/formatters/formatDateToDayMonth";
import { Ciclo } from "@prisma/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from "recharts";

type ResumoMesCardProps = {
  cicloAtual: CicloAtualDTO | null
}

export default function ResumoMesCard({cicloAtual}: ResumoMesCardProps) {

  const economiasMesTotal = cicloAtual?.economias.reduce((acc, economia) => economia.valor + acc, 0) ?? 0
  const gastosMesTotal = cicloAtual?.gastos?.reduce((acc, gasto) => gasto.valor + acc, 0) ?? 0
  const valorMesTotal = cicloAtual?.valorTotal ?? 0
  const disponivelMes = valorMesTotal - economiasMesTotal - gastosMesTotal
  
  const data = [
    { name: "Gastos", value: gastosMesTotal, color: "#ef4444" },
    { name: "Economias", value: economiasMesTotal, color: "#3b82f6" },
    { name: "Disponível", value: disponivelMes, color: "#22c55e" },
  ];

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* Título  TALVEZ TER Q VERIFICAR AQUI DEPOIS, SE FOR HORA 0, ELE PEGA O DIA ANTERIOR*/}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Resumo do Mês 
            
          </h2>
          <p className="text-sm text-gray-500 mb-2">{cicloAtual && `${formatDateToDayMonth(cicloAtual?.dataInicio)} - ${formatDateToDayMonth(cicloAtual?.dataFim)}`}</p>
        </div>

        {/* Gráfico */}
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
                label={({ percent }: any) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Infos principais */}
        <div className="grid grid-cols-2 gap-3 text-sm mt-5">
          <div className="rounded-xl p-3 text-center bg-gray-50">
            <p className="text-gray-500">Recebido</p>
            <p className="font-semibold text-gray-800">{formatCurrencyFromCents(valorMesTotal)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-red-50">
            <p className="text-gray-500">Gastos</p>
            <p className="font-semibold text-red-600">{formatCurrencyFromCents(gastosMesTotal)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-blue-50">
            <p className="text-gray-500">Economia</p>
            <p className="font-semibold text-blue-600">{formatCurrencyFromCents(economiasMesTotal)}</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-green-50">
            <p className="text-gray-500">Disponível</p>
            <p className="font-semibold text-green-600">{formatCurrencyFromCents(disponivelMes)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
