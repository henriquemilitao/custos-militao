import { useState } from "react";
import { MoreVertical, Edit, Trash2, CheckCircle, Plus, RotateCcw } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { DialogCreateEditEconomia } from "./components/dialogCreateEditEconomia";
import { toast } from "sonner";
import { formatDateShort } from "@/lib/formatters/formatDate";
import { Economia } from "@prisma/client";
import { DialogConfirmDelete, TipoItemDelete } from "../../common/dialogConfirmDelete";
import { PersonilazedDialog } from "@/components/common/personalized-dialog";

type EconomiasCardProps = {
  cicloAtual: CicloAtualDTO | null
  mutateCiclo: () => void
}

export default function EconomiasCard({ cicloAtual, mutateCiclo }: EconomiasCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentEconomia, setCurrentEconomia] = useState<Economia | null>(null)
  const [showModalSemCiclo, setShowModalSemCiclo] = useState(false)


  const handleGuardarEconomia = async (economia: Economia) => {
    try {
      const res = await fetch(`/api/economias/${economia.id}/toggle-guardar`, { method: "PATCH" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || "Erro ao atualizar economia");
        return;
      }

      toast.success(
        economia.isGuardado ? "Economia revertida com sucesso!" : "Dinheiro guardado com sucesso!",
        {
          style: economia.isGuardado
            ? { background: "#fff7ed", color: "#92400e" }
            : { background: "#dcfce7", color: "#166534" },
        }
      );

      mutateCiclo();
    } catch {
      toast.error("Não foi possível atualizar a economia");
    }
  };

  // --- estados auxiliares ---
  const economias = cicloAtual?.economias ?? [];
  const isEmpty = economias.length === 0;

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Economias</h2>
          <button
            onClick={() => {
              if (!cicloAtual?.id) {
                setShowModalSemCiclo(true);
                return;
              }
              setShowModal(true)
            }}
            className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Listagem */}
        <div className="space-y-3 min-h-[40px] flex flex-col justify-center">
          {!cicloAtual ? (
            <p className="text-xs text-gray-400 text-center">Carregando ciclo...</p>
          ) : isEmpty ? (
            <p className="text-xs text-gray-400 text-center">Nenhuma economia registrada.</p>
          ) : (
            economias.map((economia) => (
              <div
                key={economia.id}
                className={`p-3 rounded-xl border flex justify-between items-center ${
                  economia.isGuardado
                    ? "bg-green-200 border-green-400 opacity-70"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {economia.isGuardado && <CheckCircle size={18} className="text-green-600" />}
                    <p
                      className={`font-medium text-gray-800 ${
                        economia.isGuardado ? "line-through text-gray-600" : ""
                      }`}
                    >
                      {economia.nome}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Valor: {formatCurrencyFromCents(economia.valor)} (
                    {((economia.valor / cicloAtual.valorTotal)).toFixed(1)}%)
                  </p>
                  {economia.isGuardado && economia.dataGuardado && (
                    <p className="text-xs text-gray-400">
                      Guardado em {formatDateShort(economia.dataGuardado)}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-gray-200">
                      <MoreVertical size={18} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => handleGuardarEconomia(economia)}>
                      {!economia.isGuardado ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <RotateCcw size={16} className="text-yellow-500" />
                      )}
                      <p className="font-medium text-gray-600">
                        {!economia.isGuardado ? "Guardar" : "Reverter"}
                      </p>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setIsEdit(true);
                        setShowModal(true);
                        setCurrentEconomia(economia);
                      }}
                    >
                      <Edit size={16} className="text-blue-500" />
                      <p className="font-medium text-gray-600">Editar</p>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setCurrentEconomia(economia);
                        setShowConfirmDelete(true);
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                      <p className="font-medium text-gray-600">Excluir</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>

      <DialogCreateEditEconomia
        showModal={showModal}
        setShowModal={setShowModal}
        cicloAtual={cicloAtual}
        mutateCiclo={mutateCiclo}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        economia={currentEconomia}
      />

      <DialogConfirmDelete
        showModal={showConfirmDelete}
        setShowModal={(open) => {
          setShowConfirmDelete(open);
          if (!open) setCurrentEconomia(null);
        }}
        mutateCiclo={mutateCiclo}
        item={currentEconomia}
        tipoItem={TipoItemDelete.ECONOMIAS}
      />

      <PersonilazedDialog
        open={showModalSemCiclo}
        onOpenChange={setShowModalSemCiclo}
        title="Valor indisponível"
        description="Você precisa adicionar quanto você recebe nesse mês para começar a guardar dinheiro."
    
      />
    </div>
  );
}
