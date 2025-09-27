import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ProgressBar from "@/components/ui/progress-bar";

type Gasto = { nome: string; valor: number };
type GastosPorCategoria = Record<
  string,
  {
    valorDisponivel: number;
    gastoNaSemana: number;
    datas: Record<string, Gasto[]>;
  }
>;

export function ListagemPorCategoria({
  gastosPorCategoria,
}: {
  gastosPorCategoria: GastosPorCategoria;
}) {
  console.log(Object.entries(gastosPorCategoria).length);
  return (
    <div className={`space-y-8 ${Object.entries(gastosPorCategoria).length === 0 ? "mb-4" : "mb-11"}`}>
      {Object.entries(gastosPorCategoria).map(
        ([categoria, { valorDisponivel, gastoNaSemana, datas }]) => {
          // dentro do map da categoria
          const porcentagem =
            valorDisponivel > 0 ? (gastoNaSemana / valorDisponivel) * 100 : 0;

          return (
            <div key={categoria}>
              {/* Cabeçalho da categoria */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-base font-bold text-gray-700">
                    {categoria}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {formatCurrencyFromCents(gastoNaSemana)} /{" "}
                    {formatCurrencyFromCents(valorDisponivel)}
                  </span>
                </div>
                <ProgressBar
                  percent={porcentagem}
                  // forceGreen={valorDisponivel >= gastoNaSemana} // fica verde se ainda está dentro da meta
                />
              </div>

              {/* Gastos agrupados por data */}
              <div className="space-y-2">
                {Object.entries(datas).map(([data, gastos]) => (
                  <div key={data}>
                    {/* Data */}
                    <div className="bg-gray-50 text-xs text-gray-500 px-2 py-1 rounded-md ml-2 mb-1">
                      📅 {data}
                    </div>

                    {/* Itens */}
                    <ul className="space-y-2 ml-4">
                      {gastos.map((g, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center text-sm pr-2"
                        >
                          <span>{g.nome}</span>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {formatCurrencyFromCents(g.valor)}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}