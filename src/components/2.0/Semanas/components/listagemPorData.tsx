import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { useState } from "react";
import { DialogConfirmDelete, TipoItemDelete } from "@/components/common/dialogConfirmDelete";

import { parse, format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatarData(data: string | Date) {
  let dateObj: Date;

  if (typeof data === "string") {
    dateObj = parse(data, "yyyy-MM-dd", new Date());
    if (!isValid(dateObj)) {
      dateObj = parse(data, "dd/MM/yyyy", new Date());
    }
  } else {
    dateObj = data;
  }

  if (!isValid(dateObj)) return data.toString();

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);

  if (dateObj.toDateString() === hoje.toDateString()) return "Hoje";
  if (dateObj.toDateString() === ontem.toDateString()) return "Ontem";
  if (dateObj.toDateString() === amanha.toDateString()) return "Amanhã";

  const formatted = format(dateObj, "dd/MM - EEEE", { locale: ptBR });

  // quebra em duas partes: "21/09" e "domingo"
  const [dataParte, diaParte] = formatted.split(" - ");

  // capitaliza só o dia da semana
  const diaCapitalizado = diaParte.charAt(0).toUpperCase() + diaParte.slice(1);

  return `${dataParte} - ${diaCapitalizado}`;
}





type Gasto = { id: string; name: string; valor: number; data: Date; gastoId: string };
type GastosPorCategoria = Record<
  string,
  {
    valorDisponivel: number;
    gastoNaSemana: number;
    datas: Record<string, Gasto[]>;

  }
>;

type GastosPorCategoriaProps = {
  gastosPorCategoria: GastosPorCategoria;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
  isEdit: boolean;
  setIsEdit: (edit: boolean) => void;
  setCurrentGasto: (gasto: { id: string; name: string; valor: number; data: Date; gastoId: string } | null) => void;
  currentGasto: { id: string; name: string; valor: number; data: Date; gastoId: string } | null;
};

export function ListagemPorCategoria({
  gastosPorCategoria,
  setShowModal,
  mutateCiclo,
  setIsEdit,
  setCurrentGasto,
  currentGasto
}: GastosPorCategoriaProps) {

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  return (
    <div className={`space-y-8 ${Object.entries(gastosPorCategoria).length === 0 ? "mb-4" : "mb-6"}`}>
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
                    {categoria === 'Aleatório' ? 'Livre' : categoria}
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
                {Object.entries(datas)
                  .sort(([dataA], [dataB]) => {
                    const dateA = new Date(dataA).getTime();
                    const dateB = new Date(dataB).getTime();
                    return dateA - dateB; // crescente
                  })
                  .map(([data, gastos]) => (
                    <div key={data}>
                      {/* Data */}
                      <div className="bg-gray-50 text-xs text-gray-500 px-2 py-1 rounded-md ml-2 mb-1">
                        📅 {formatarData(data)}
                      </div>

                      {/* Itens */}
                      <ul className="space-y-2 ml-4">
                        {gastos.map((g, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center text-sm pr-2"
                          >
                            <span>{g.name}</span>

                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {formatCurrencyFromCents(g.valor)}
                              </span>
                              {/* Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-gray-200 text-gray-400">
                                    <MoreVertical size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setIsEdit(true);
                                      setCurrentGasto({
                                        id: g.id,
                                        name: g.name,
                                        valor: g.valor,
                                        data: g.data,
                                        gastoId: g.gastoId,
                                      });
                                      setShowModal(true);
                                    }}
                                  >
                                    <Edit size={16} className="text-blue-500" />
                                    <p className="font-medium text-gray-600">Editar</p>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setCurrentGasto({
                                        id: g.id,
                                        name: g.name,
                                        valor: g.valor,
                                        data: g.data,
                                        gastoId: g.gastoId,
                                      });
                                    setShowConfirmDelete(true)
                                    }}>
                                    <Trash2 size={16} className="text-red-500" />
                                    <p className="font-medium text-gray-600">Excluir</p>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      
      {/* Modal passa mutate */}
      <DialogConfirmDelete
        showModal={showConfirmDelete} 
        setShowModal={(open) => {
          setShowConfirmDelete(open);
          if (!open) setCurrentGasto(null); // limpa quando fechar
        }}
        mutateCiclo={mutateCiclo}
        item={currentGasto}
        tipoItem={TipoItemDelete.REGISTROS}
      />
    </div>
  );
}