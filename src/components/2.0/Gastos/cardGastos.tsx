// ...seus imports (mantive como estavam)
import { useState } from "react";
import { MoreVertical, Edit, Trash2, CheckCircle, Plus, RotateCcw } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatDateShort } from "@/lib/formatters/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DialogCreateEditGasto } from "./components/dialogCreateEditGasto";
import { Gasto } from "@prisma/client";
import { toast } from "sonner";
import { DialogConfirmDelete, TipoItemDelete } from "@/components/common/dialogConfirmDelete";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import ProgressBar from "@/components/ui/progress-bar";

const getBgClass = (percent: number) => {
  if (percent > 100) return "bg-red-100 border-red-300"; // passou da meta
  if (percent > 80) return "bg-red-50 border-red-200";
  if (percent >= 70) return "bg-orange-50 border-orange-200";
  if (percent >= 60) return "bg-yellow-50 border-yellow-200";
  if (percent === 0) return "bg-gray-50 border-gray-200";
  return "bg-green-50 border-green-200";
};



type GastosCardProps = {
  cicloAtual: CicloAtualDTO | null;
  mutateCiclo: () => void;
};

export default function GastosCard({ cicloAtual, mutateCiclo }: GastosCardProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentGasto, setCurrentGasto] = useState<Gasto | null>(null);

  const findTotalGastoPorMeta = (gastoId: string) => {
    return cicloAtual?.gastosPorMetaTotais.find((g) => g.id === gastoId);
  };

  // const ProgressBar = ({ percent }: { percent: number }) => (
  //   <div className="w-full bg-gray-200 rounded-full h-2">
  //     <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
  //   </div>
  // );

  
  const handleGuardarGasto = async (gasto: Gasto) => {
    try {

      const res = await fetch(`/api/gastos/${gasto.id}/toggle-pagar`, {
        method: "PATCH",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erro ao atualizar gasto");
        return;
      }

      toast.success(
        gasto.isPago
          ? "Pagamento revertido com sucesso!"
          : "Pagamento efetuado com sucesso!",
        {
          style: gasto.isPago
            ? { background: "#fff7ed", color: "#92400e" } // laranja/quase warning
            : { background: "#dcfce7", color: "#166534" }, // verdinho
        }
      );

      mutateCiclo();
    } catch (err) {
      toast.error("Não foi possível atualizar a gasto");
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Gastos</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Listagem */}
        <div className="space-y-3">
          {cicloAtual ? (
            cicloAtual.gastos.map((gasto) => {
              const totaisGasto = gasto.tipo === "goal" ? findTotalGastoPorMeta(gasto.id) : null;

              // <-- CORREÇÃO: coalesce antes da divisão e cálculo do percent com proteção
              const jaGastoCents = totaisGasto?.totalJaGasto ?? 0;
              const disponivelCents = totaisGasto?.totalDisponivel ?? 0;
              const metaCents = gasto.valor ?? 0;
              const percent = metaCents > 0 ? Math.min((jaGastoCents / metaCents) * 100, 100) : 0;
              
              // calcula o percent real, sem travar em 100
              const percentRaw = metaCents > 0 ? (jaGastoCents / metaCents) * 100 : 0;

              // mas a barra de progresso não pode passar de 100%
              const percentBar = Math.min(percentRaw, 100);
              
              return (
                <div
                  key={gasto.id}
                  className={`p-3 rounded-xl border flex justify-between items-start ${
                    gasto.tipo === "single" && gasto.isPago
                      ? "bg-green-200 border-green-400 opacity-70"
                      : gasto.tipo === "goal"
                      ? getBgClass(percentRaw) // <<< usa a função de cor
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Infos */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      {gasto.tipo === "single" && gasto.isPago && (
                        <CheckCircle size={18} className="text-green-600" />
                      )}
                      {gasto.tipo === "goal" && percent >= 100 && (
                        <CheckCircle size={18} className="text-green-600" />
                      )}
                      <p
                        className={`font-medium text-gray-800 ${
                          gasto.tipo === "single" && gasto.isPago
                            ? "line-through text-gray-600"
                            : gasto.tipo === "goal" && percent >= 100
                            ? "line-through text-gray-600"
                            : ""
                        }`}
                      >
                        {gasto.name}
                      </p>
                    </div>

                    {gasto.tipo === "single" && (
                      <>
                        <p className="text-sm text-gray-500">Valor: {formatCurrencyFromCents(gasto.valor)}</p>
                        {gasto.isPago && gasto.dataPago && (
                          <p className="text-xs text-gray-400">Pago em {formatDateShort(gasto.dataPago)}</p>
                        )}
                      </>
                    )}

                    {gasto.tipo === "goal" && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-gray-500">
                          Meta: <span className="font-medium">{formatCurrencyFromCents(metaCents)}</span>
                        </p>
                        <p className="text-gray-500">
                          Já gastei:{" "}
                          <span className="font-medium text-red-500">
                            {formatCurrencyFromCents(jaGastoCents)}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          Disponível:{" "}
                          <span className="font-medium text-green-600">
                            {formatCurrencyFromCents(disponivelCents)}
                          </span>
                        </p>
                        <ProgressBar percent={percentRaw} />
                        <p className="text-xs text-gray-400">
                          Gastei {percentRaw.toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-200">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {gasto.tipo === "single" && (
                        <DropdownMenuItem
                          onClick={() => handleGuardarGasto(gasto)}
                        >
                          {!gasto.isPago ?
                            <CheckCircle size={16} className="text-green-500" />
                            :
                            <RotateCcw size={16} className="text-yellow-500" />
                          }                          
                          <p className="font-medium text-gray-600">{!gasto.isPago ? 'Pagar' : 'Reverter'}</p>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => { 
                        setIsEdit(true); 
                        setCurrentGasto(gasto); 
                        setShowModal(true); 
                        }}>
                        <Edit size={16} className="text-blue-500" />
                        <p className="font-medium text-gray-600">Editar</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setCurrentGasto(gasto)
                        setShowConfirmDelete(true)
                        }}>
                        <Trash2 size={16} className="text-red-500" />
                        <p className="font-medium text-gray-600">Excluir</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 mt-7">Nenhum gasto registrado.</p>
          )}
        </div>
      </div>

      {/* Modal criar/editar gasto */}
      <DialogCreateEditGasto
        showModal={showModal}
        setShowModal={setShowModal}
        cicloAtual={cicloAtual}
        mutateCiclo={mutateCiclo}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        gasto={currentGasto}
      />

      {/* Modal passa mutate */}
      <DialogConfirmDelete
        showModal={showConfirmDelete} 
        setShowModal={(open) => {
          setShowConfirmDelete(open);
          if (!open) setCurrentGasto(null); // limpa quando fechar
        }}
        mutateCiclo={mutateCiclo}
        item={currentGasto}
        tipoItem={TipoItemDelete.GASTOS}
      />
    </div>
  );
}
