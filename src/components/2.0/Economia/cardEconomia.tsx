import { useState, useEffect, useRef } from "react";
import { MoreVertical, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import { CicloAtualDTO } from "@/dtos/ciclo.dto";
import { formatCurrencyFromCents } from "@/lib/formatCurrency";
import { createPortal } from "react-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { DialogCreateEditEconomia } from "./components/dialogCreateEditEconomia";

type EconomiasCardProps = {
  cicloAtual: CicloAtualDTO | null
}

export default function EconomiasCard({ cicloAtual }: EconomiasCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Economias</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="space-y-3">
          {cicloAtual ? cicloAtual.economias.map((economia) => (
            <div
              key={economia.id}
              className={`p-3 rounded-xl border flex justify-between items-center ${
                economia.isPago
                  ? "bg-green-100 border-green-300 opacity-90"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {economia.isPago && <CheckCircle size={18} className="text-green-600" />}
                  <p
                    className={`font-medium text-gray-800 ${
                      economia.isPago ? "line-through text-gray-600" : ""
                    }`}
                  >
                    {economia.nome}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Valor: {formatCurrencyFromCents(economia.valor)} (
                  {((economia.valor / cicloAtual.valorTotal) * 100).toFixed(1)}%)
                </p>
                {economia.isPago && economia.dataPago && (
                  <p className="text-xs text-gray-400">
                    Guardado em {economia.dataPago.toISOString()}
                  </p>
                )}
              </div>

              {/* Botão de menu */}              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-gray-200">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem>
                    <CheckCircle size={16} className="text-green-500" />
                    <p className="font-medium text-gray-600">Economizar</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit size={16} className="text-blue-500" />
                    <p className="font-medium text-gray-600">Editar</p>

                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 size={16} className="text-red-500" />
                    <p className="font-medium text-gray-600">Excluir</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )) : <p className="text-xs text-gray-400 mt-7">Nenhuma economia registrada.</p>}
        </div>
      </div>

      {/* Modal de nova economia */}
      <DialogCreateEditEconomia showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
}
