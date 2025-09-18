"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from "recharts";

export default function ResumoMesCard() {
  const data = [
    { name: "Gastos", value: 820, color: "#ef4444" },
    { name: "Economias", value: 300, color: "#3b82f6" },
    { name: "Disponível", value: 630, color: "#22c55e" },
  ];

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* Título */}
        {/* <div className="flex">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Resumo do Mês/Ciclo
          </h2>
          <h3>01/09 - 30/09</h3>
        </div> */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Resumo do Mês/Ciclo
          </h2>
          <p className="text-sm text-gray-500 mb-2">01/09 - 07/09</p>
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
            <p className="font-semibold text-gray-800">R$ 1.750,00</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-red-50">
            <p className="text-gray-500">Gastos</p>
            <p className="font-semibold text-red-600">R$ 820,00</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-blue-50">
            <p className="text-gray-500">Economia</p>
            <p className="font-semibold text-blue-600">R$ 300,00</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-green-50">
            <p className="text-gray-500">Disponível</p>
            <p className="font-semibold text-green-600">R$ 630,00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
