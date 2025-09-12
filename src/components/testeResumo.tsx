"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ResumoMesCard() {
  const data = [
    { name: "Gastos", value: 820 },
    { name: "Economias", value: 300 },
    { name: "Disponível", value: 630 },
  ];

  // Ajustando cores: vermelho para gastos, azul para economia, verde para disponível
  const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Resumo do Mês
        </h2>

        {/* Gráfico */}
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Infos principais */}
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <p className="text-gray-500">Recebido</p>
            <p className="font-semibold text-gray-800">R$ 1.750,00</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <p className="text-gray-500">Gastos</p>
            <p className="font-semibold text-red-500">R$ 820,00</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <p className="text-gray-500">Economia</p>
            <p className="font-semibold text-blue-500">R$ 300,00</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <p className="text-gray-500">Disponível</p>
            <p className="font-semibold text-green-500">R$ 630,00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
