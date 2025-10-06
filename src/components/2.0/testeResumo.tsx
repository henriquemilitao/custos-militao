"use client";

import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { formatDateDayMonth, getPeriodoAtual } from "@/lib/formatters/formatDate";
// import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, LineChart, Line, Area, AreaChart, LabelList } from "recharts";
import EditableCurrency from "../EditableCurrency";
import { Doughnut } from "react-chartjs-2";

import { toast } from "sonner";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);



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
  dataInicio: string | undefined;
  dataFim: string | undefined;
  setDatas: (datas: {inicio: string; fim: string}) => void
}

export default function ResumoMesCard({cicloAtual, mutateCiclo, dataInicio, dataFim, setDatas}: ResumoMesCardProps) {
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
    // console.log('ENTRANDO NA s')
    try {
      const res = await fetch(`/api/ciclos`, {
        method: "POST",
        body: JSON.stringify({ 
          valorCents: novoTotal,
          dataInicio,
          dataFim
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);
      // console.log('RESPOSTA DEPOIS DE IR PARA A ROTA')
      // console.log({data})

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


  // const chartData = {
  //   labels: ["Gastos", "Economias", "Disponível"],
  //   datasets: [
  //       {
  //         data: [
  //           cicloAtual?.gastoTotalJaRealizado ?? 0,
  //           cicloAtual?.economiasJaGuardadas ?? 0,
  //           cicloAtual?.disponivelMes ?? 0,
  //         ],
  //         backgroundColor: ["#ef4444", "#3b82f6", "#22c55e"],
  //       },
  //   ],
  // };
  
    const gastos = cicloAtual?.gastoTotalJaRealizado ?? 0;
    const economias = cicloAtual?.economiasJaGuardadas ?? 0;
    const disponivel = cicloAtual?.disponivelMes ?? 0;

    // no gráfico, se disponível for negativo, vira 0
    const dadosGrafico = [
      gastos,
      economias,
      disponivel > 0 ? disponivel : 0,
    ];

  const datasMes = dataInicio && dataFim 
                  ? { inicio: dataInicio, fim: dataFim }
                  : getPeriodoAtual()

  // Se não existir nenhum ciclo ainda, eu seto o mes atual como parametro
  if (!dataInicio && !dataFim)
    setDatas({
      inicio: datasMes.inicio, 
      fim: datasMes.fim
  })
  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {/* Título  TALVEZ TER Q VERIFICAR AQUI DEPOIS, SE FOR HORA 0, ELE PEGA O DIA ANTERIOR*/}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Resumo do Mês 
            
          </h2>

          <p className="text-sm text-gray-500 mb-2">{
            `${formatDateDayMonth(datasMes.inicio)} - ${formatDateDayMonth(datasMes.fim)}`
            }
          </p>

        {/* {cicloAtual?.id &&  
          <p className="text-sm text-gray-500 mb-2">{
            cicloAtual && `
              ${formatDateDayMonth(cicloAtual?.dataInicio)} - ${formatDateDayMonth(cicloAtual?.dataFim)}
              `
            }</p>
        } */}
        </div>

        {/* Gráfico */}
        {cicloAtual?.id &&  
          <div className="h-60 flex items-center justify-center">
            {/* <ResponsiveContainer>
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
            </ResponsiveContainer> */}

              
              {/* <Doughnut
                data={chartData}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${context.label}: ${formatCurrencyFromCents(context.parsed)} (${(
                            (context.parsed /
                              context.dataset.data.reduce((a: number, b: number) => a + b, 0)) *
                            100
                          ).toFixed(0)}%)`,
                      },
                    },
                  },
                }}
              /> */}



            <Doughnut
              data={{
                labels: ["Gastos", "Economias", "Disponível"],
                datasets: [
                  {
                    data: dadosGrafico,
                    backgroundColor: ["#ef4444", "#3b82f6", "#22c55e"],
                  },
                ],
              }}
              options={{
                layout: { padding: 54 },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const dataset = ctx.dataset.data as number[];
                        const total = dataset.reduce((a, b) => a + b, 0);
                        const percent = ((ctx.parsed / total) * 100).toFixed(1);
                        return `${ctx.label}: ${formatCurrencyFromCents(ctx.parsed)} (${percent}%)`;
                      },
                    },
                  },
                  datalabels: {
                    color: (ctx) => {
                      const dataset = ctx.dataset;
                      const index = ctx.dataIndex;
                      const bg = dataset.backgroundColor as string[];
                      return bg[index];
                    },
                    font: { weight: "bold" as const, size: 12 },
                    anchor: "end",
                    align: "end",
                    formatter: (value, ctx) => {
                      const dataset = ctx.chart.data.datasets[0].data as number[];
                      const total = dataset.reduce((a, b) => a + b, 0);
                      if (total === 0) return "0%";
                      const percent = Math.round((value / cicloAtual.valorTotal) * 10) / 10;
                      // console.log(Number.isInteger(percent))
                      // if (percent % 2 === 0) return `${percent.toFixed(0)}%`;
                      return `${percent}%`;
                    },
                     offset: (ctx) => {
                      // cada label ganha um offset diferente
                      const index = ctx.dataIndex;
                      // exemplo: alterna offsets pra dar espaçamento
                      return 0 + index * 9; 
                      // 👉 o primeiro terá 20px, o segundo 30px, o terceiro 40px de distância
                      // se quiser menos exagerado, troca por 20 + index * 5
                    },
                  },
                },
              }}
            />



              
        {/* <ResponsiveContainer width="100%" height={300} 
          className="mt-10"
        >
          <BarChart data={data} barSize={60}>
          <XAxis dataKey="name" tick={{ fontSize: 14 }} />
          <YAxis tick={{ fontSize: 14 }} />
          <Tooltip formatter={(value) => `R$ ${value}`} />
            <Bar dataKey="value">
            {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
              <LabelList
                dataKey="value"
                position="top"
                content={({ value, x, y, width }) => {
                if (value == null) return null;

                const numericValue = Number(value);
                const percent = ((numericValue / total) * 100).toFixed(1);

                return (
                <text
                x={Number(x) + Number(width) / 2}
                y={Number(y) - 5}
                textAnchor="middle"
                fill="#333"
                fontSize={12}
                fontWeight="bold"
                >
                {percent}%
                </text>
                );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer> */}

        
      </div>
        }

        {/* Infos principais */}
        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
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
